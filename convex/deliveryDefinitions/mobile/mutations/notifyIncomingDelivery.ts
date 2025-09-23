import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';
import { Id } from '../../../_generated/dataModel';
import { api } from '../../../_generated/api';

export const mobileNotifyIncomingDeliveryArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')),
  deliveryType: v.union(
    v.literal('package'),
    v.literal('food'),
    v.literal('grocery'),
    v.literal('mail'),
    v.literal('other')
  ),
  senderName: v.string(),
  senderCompany: v.optional(v.string()),
  recipientName: v.string(),
  recipientPhone: v.optional(v.string()),
  recipientEmail: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
  description: v.string(),
  estimatedDelivery: v.number(), // Timestamp
  deliveryLocation: v.optional(v.string()),
  deliveryNotes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())),
});

export const mobileNotifyIncomingDeliveryReturns = v.object({
  success: v.boolean(),
  deliveryId: v.optional(v.id('deliveries')),
  message: v.optional(v.string()),
});

export const mobileNotifyIncomingDeliveryHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileNotifyIncomingDeliveryArgs>
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

  // Verify property access - user must be a tenant in the property or a manager
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    return { success: false, message: 'Property not found' };
  }

  // Check if user is a tenant in the property or a manager
  let hasAccess = false;
  if (currentUser.role === 'manager' && property.managerId === currentUser._id) {
    hasAccess = true;
  } else if (currentUser.role === 'tenant') {
    // Check if tenant has access to the unit or property
    if (args.unitId) {
      const unit = await ctx.db.get(args.unitId);
      if (unit && unit.tenantId === currentUser._id) {
        hasAccess = true;
      }
    } else {
      // Check if tenant belongs to this property
      const userProperty = await ctx.db
        .query('userProperties')
        .withIndex('by_user_property', q => q.eq('userId', currentUser._id).eq('propertyId', args.propertyId))
        .first();
      hasAccess = !!userProperty;
    }
  }

  if (!hasAccess) {
    return { success: false, message: 'Access denied to this property' };
  }

  // Validate unit belongs to property if specified
  if (args.unitId) {
    const unit = await ctx.db.get(args.unitId);
    if (!unit) {
      return { success: false, message: 'Unit not found' };
    }
    if (unit.propertyId !== args.propertyId) {
      return { success: false, message: 'Unit does not belong to the specified property' };
    }
  }

  // Validate estimated delivery time
  const now = Date.now();
  if (args.estimatedDelivery <= now) {
    return { success: false, message: 'Estimated delivery time must be in the future' };
  }

  try {
    // Create the delivery notification
    const deliveryId = await ctx.db.insert('deliveries', {
      propertyId: args.propertyId,
      unitId: args.unitId,
      deliveryType: args.deliveryType,
      senderName: args.senderName,
      senderCompany: args.senderCompany,
      recipientName: args.recipientName,
      recipientPhone: args.recipientPhone,
      recipientEmail: args.recipientEmail,
      trackingNumber: args.trackingNumber,
      description: args.description,
      estimatedDelivery: args.estimatedDelivery,
      status: 'pending',
      deliveryLocation: args.deliveryLocation,
      deliveryNotes: args.deliveryNotes,
      photos: args.photos,
      createdAt: now,
      updatedAt: now,
    });

    // Create delivery log entry
    await ctx.db.insert('deliveryLogs', {
      deliveryId,
      propertyId: args.propertyId,
      action: 'registered',
      timestamp: now,
      performedBy: currentUser._id,
      notes: `Delivery notification created by ${currentUser.firstName} ${currentUser.lastName} via mobile app`,
      createdAt: now,
    });

    // Send push notification to relevant users
    // If delivery is for a specific unit, notify the tenant
    if (args.unitId) {
      const unit = await ctx.db.get(args.unitId);
      if (unit && unit.tenantId) {
        // Schedule push notification to tenant
        await ctx.scheduler.runAfter(0, api.pushNotifications.sendDeliveryNotification, {
          userId: unit.tenantId,
          deliveryId,
          title: '📦 New Delivery Incoming',
          body: `${args.deliveryType} delivery from ${args.senderName} expected ${new Date(args.estimatedDelivery).toLocaleDateString()}`,
          data: {
            type: 'delivery_incoming',
            deliveryId: deliveryId.toString(),
          },
        });
      }
    } else {
      // For property-wide deliveries, notify all tenants of the property
      const propertyUnits = await ctx.db
        .query('units')
        .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
        .collect();

      for (const unit of propertyUnits) {
        if (unit.tenantId) {
          await ctx.scheduler.runAfter(0, api.pushNotifications.sendDeliveryNotification, {
            userId: unit.tenantId,
            deliveryId,
            title: '📦 New Delivery Incoming',
            body: `${args.deliveryType} delivery from ${args.senderName} expected ${new Date(args.estimatedDelivery).toLocaleDateString()}`,
            data: {
              type: 'delivery_incoming',
              deliveryId: deliveryId.toString(),
            },
          });
        }
      }
    }

    return {
      success: true,
      deliveryId,
      message: 'Delivery notification created successfully',
    };
  } catch (error) {
    console.error('Error creating delivery notification:', error);
    return {
      success: false,
      message: 'Failed to create delivery notification',
    };
  }
};
