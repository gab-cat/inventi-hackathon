import { v } from 'convex/values';
import { Id } from '../../../_generated/dataModel';
import { QueryCtx } from '../../../_generated/server';

export const webGetDeliveryByIdArgs = {
  deliveryId: v.id('deliveries'),
} as const;

export const webGetDeliveryByIdReturns = v.union(
  v.null(),
  v.object({
    _id: v.id('deliveries'),
    _creationTime: v.number(),
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
    estimatedDelivery: v.number(),
    actualDelivery: v.optional(v.number()),
    status: v.union(
      v.literal('pending'),
      v.literal('in_transit'),
      v.literal('delivered'),
      v.literal('collected'),
      v.literal('failed'),
      v.literal('returned')
    ),
    deliveryLocation: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
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
  })
);

type Args = {
  deliveryId: Id<'deliveries'>;
};

export const webGetDeliveryByIdHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get the delivery
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) return null;

  // Get property info
  const property = await ctx.db.get(delivery.propertyId);
  if (!property) throw new Error('Property not found');

  // Verify user has access to this property
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Get unit info if applicable
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

  return {
    ...delivery,
    property: {
      _id: property._id,
      name: property.name,
      address: property.address,
    },
    unit,
  };
};
