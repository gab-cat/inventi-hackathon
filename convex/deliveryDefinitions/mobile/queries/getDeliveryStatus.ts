import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileGetDeliveryStatusArgs = v.object({
  deliveryId: v.id('deliveries'),
});

export const mobileGetDeliveryStatusReturns = v.object({
  success: v.boolean(),
  delivery: v.optional(
    v.object({
      _id: v.id('deliveries'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      deliveryType: v.string(),
      senderName: v.string(),
      senderCompany: v.optional(v.string()),
      recipientName: v.string(),
      recipientPhone: v.optional(v.string()),
      recipientEmail: v.optional(v.string()),
      trackingNumber: v.optional(v.string()),
      description: v.string(),
      estimatedDelivery: v.number(),
      actualDelivery: v.optional(v.number()),
      status: v.string(),
      deliveryLocation: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      blockchainTxHash: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Additional enriched data
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      unit: v.optional(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
        })
      ),
      logs: v.array(
        v.object({
          _id: v.id('deliveryLogs'),
          action: v.string(),
          timestamp: v.number(),
          performedBy: v.union(v.id('users'), v.string()),
          performedByName: v.string(),
          notes: v.optional(v.string()),
          createdAt: v.number(),
        })
      ),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileGetDeliveryStatusHandler = async (
  ctx: QueryCtx,
  args: Infer<typeof mobileGetDeliveryStatusArgs>
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

  try {
    // Get property information
    const property = await ctx.db.get(delivery.propertyId);
    if (!property) {
      return { success: false, message: 'Property not found' };
    }

    // Get unit information if applicable
    let unit = undefined;
    if (delivery.unitId) {
      const unitData = await ctx.db.get(delivery.unitId);
      if (unitData) {
        unit = {
          _id: unitData._id,
          unitNumber: unitData.unitNumber,
        };
      }
    }

    // Get delivery logs with user information
    const deliveryLogs = await ctx.db
      .query('deliveryLogs')
      .withIndex('by_delivery', q => q.eq('deliveryId', args.deliveryId))
      .order('desc')
      .collect();

    // Enrich logs with user names
    const enrichedLogs = await Promise.all(
      deliveryLogs.map(async log => {
        const performer = log.performedBy ? await ctx.db.get(log.performedBy) : null;
        return {
          _id: log._id,
          action: log.action,
          timestamp: log.timestamp,
          performedBy: log.performedBy || ('' as any), // Provide fallback for compatibility
          performedByName: performer ? `${performer.firstName} ${performer.lastName}` : 'System',
          notes: log.notes,
          createdAt: log.createdAt,
        };
      })
    );

    const enrichedDelivery = {
      ...delivery,
      property: {
        _id: property._id,
        name: property.name,
        address: property.address,
      },
      unit,
      logs: enrichedLogs,
    };

    return {
      success: true,
      delivery: enrichedDelivery,
    };
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    return {
      success: false,
      message: 'Failed to fetch delivery status',
    };
  }
};
