import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';
import { api } from '../../../_generated/api';

export const mobileConfirmDeliveryReceiptArgs = v.object({
  deliveryId: v.id('deliveries'),
  notes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())),
  rating: v.optional(v.number()), // Rating from 1-5
});

export const mobileConfirmDeliveryReceiptReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const mobileConfirmDeliveryReceiptHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileConfirmDeliveryReceiptArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) {
    return { success: false, message: 'User not found' };
  }

  // Get the delivery
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) {
    return { success: false, message: 'Delivery not found' };
  }

  // Verify user has access to this delivery
  let hasAccess = false;
  if (currentUser.role === 'manager') {
    const property = await ctx.db.get(delivery.propertyId);
    hasAccess = property?.managerId === currentUser._id;
  } else if (currentUser.role === 'tenant') {
    // Check if tenant is the recipient or has access to the unit
    if (delivery.unitId) {
      const unit = await ctx.db.get(delivery.unitId);
      hasAccess = unit?.tenantId === currentUser._id;
    } else {
      // Check if tenant belongs to this property
      const userProperty = await ctx.db
        .query('userProperties')
        .withIndex('by_user_property', q => q.eq('userId', currentUser._id).eq('propertyId', delivery.propertyId))
        .first();
      hasAccess = !!userProperty;
    }
  }

  if (!hasAccess) {
    return { success: false, message: 'Access denied to this delivery' };
  }

  // Check if delivery can be confirmed as received
  if (!['delivered', 'in_transit'].includes(delivery.status)) {
    return { success: false, message: 'Only delivered or in-transit deliveries can be confirmed' };
  }

  const now = Date.now();

  try {
    // Update the delivery status to collected
    await ctx.db.patch(args.deliveryId, {
      status: 'collected',
      actualDelivery: delivery.actualDelivery || now,
      updatedAt: now,
    });

    // Create delivery log entry
    await ctx.db.insert('deliveryLogs', {
      deliveryId: args.deliveryId,
      propertyId: delivery.propertyId,
      action: 'collected',
      timestamp: now,
      performedBy: currentUser._id,
      notes:
        args.notes ||
        `Delivery confirmed as received by ${currentUser.firstName} ${currentUser.lastName} via mobile app`,
      createdAt: now,
    });

    // TODO: Store rating and photos if provided
    // This could be extended to include delivery feedback/rating system

    // Send notification to property manager about delivery confirmation
    const property = await ctx.db.get(delivery.propertyId);
    if (property && property.managerId) {
      await ctx.scheduler.runAfter(0, api.pushNotifications.sendDeliveryNotification, {
        userId: property.managerId,
        deliveryId: args.deliveryId,
        title: '✅ Delivery Confirmed',
        body: `Delivery for ${delivery.recipientName} has been confirmed as received by ${currentUser.firstName} ${currentUser.lastName}`,
        data: {
          type: 'delivery_confirmed',
          deliveryId: args.deliveryId.toString(),
        },
      });
    }

    return {
      success: true,
      message: 'Delivery receipt confirmed successfully',
    };
  } catch (error) {
    console.error('Error confirming delivery receipt:', error);
    return {
      success: false,
      message: 'Failed to confirm delivery receipt',
    };
  }
};
