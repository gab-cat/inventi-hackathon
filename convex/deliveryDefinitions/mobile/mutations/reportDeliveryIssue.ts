import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';
import { api } from '../../../_generated/api';

export const mobileReportDeliveryIssueArgs = v.object({
  deliveryId: v.id('deliveries'),
  issueType: v.union(
    v.literal('damaged'),
    v.literal('missing'),
    v.literal('wrong_item'),
    v.literal('wrong_recipient'),
    v.literal('late_delivery'),
    v.literal('other')
  ),
  description: v.string(),
  photos: v.optional(v.array(v.string())),
  requestRefund: v.optional(v.boolean()),
});

export const mobileReportDeliveryIssueReturns = v.object({
  success: v.boolean(),
  issueId: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileReportDeliveryIssueHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileReportDeliveryIssueArgs>
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

  const now = Date.now();

  try {
    // Update delivery status to failed if not already final
    if (!['collected', 'returned'].includes(delivery.status)) {
      await ctx.db.patch(args.deliveryId, {
        status: 'failed',
        updatedAt: now,
      });
    }

    // Create delivery log entry for the issue
    await ctx.db.insert('deliveryLogs', {
      deliveryId: args.deliveryId,
      propertyId: delivery.propertyId,
      action: 'failed',
      timestamp: now,
      performedBy: currentUser._id,
      notes: `Issue reported: ${args.issueType} - ${args.description} (Reported by ${currentUser.firstName} ${currentUser.lastName} via mobile app)`,
      createdAt: now,
    });

    // TODO: Create a delivery issue ticket in a separate issues table
    // This could integrate with a customer service or maintenance system
    const issueId = `ISSUE-${args.deliveryId}-${now}`;

    // Send notification to property manager about delivery issue
    const property = await ctx.db.get(delivery.propertyId);
    if (property && property.managerId) {
      await ctx.scheduler.runAfter(0, api.pushNotifications.sendDeliveryNotification, {
        userId: property.managerId,
        deliveryId: args.deliveryId,
        title: '🚨 Delivery Issue Reported',
        body: `${args.issueType}: ${args.description} (Reported by ${currentUser.firstName} ${currentUser.lastName})`,
        data: {
          type: 'delivery_issue',
          deliveryId: args.deliveryId.toString(),
        },
      });
    }

    return {
      success: true,
      issueId,
      message: 'Delivery issue reported successfully. A manager will be notified.',
    };
  } catch (error) {
    console.error('Error reporting delivery issue:', error);
    return {
      success: false,
      message: 'Failed to report delivery issue',
    };
  }
};
