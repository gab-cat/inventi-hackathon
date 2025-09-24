import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webMarkDeliveryAsCollectedArgs = {
  deliveryId: v.id('deliveries'),
  notes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())), // Collection photos
} as const;

export const webMarkDeliveryAsCollectedReturns = v.object({
  _id: v.id('deliveries'),
  _creationTime: v.number(),
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')),
  piiHash: v.optional(v.string()),
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
});

type Args = {
  deliveryId: Id<'deliveries'>;
  notes?: string;
  photos?: string[];
};

export const webMarkDeliveryAsCollectedHandler = async (ctx: MutationCtx, args: Args) => {
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
  if (!delivery) throw new Error('Delivery not found');

  // Verify property access
  const property = await ctx.db.get(delivery.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Check if delivery can be marked as collected
  if (!['arrived'].includes(delivery.status)) {
    throw new Error('Only arrived deliveries can be marked as collected');
  }

  const now = Date.now();

  // Update the delivery
  await ctx.db.patch(args.deliveryId, {
    status: 'collected',
    actualDelivery: now,
    updatedAt: now,
  });

  // Create delivery log entry
  await ctx.db.insert('deliveryLogs', {
    deliveryId: args.deliveryId,
    propertyId: delivery.propertyId,
    action: 'collected',
    timestamp: now,
    performedBy: currentUser._id,
    notes: args.notes || `Delivery collected by ${currentUser.firstName} ${currentUser.lastName}`,
    createdAt: now,
  });

  // Return the updated delivery
  const updatedDelivery = await ctx.db.get(args.deliveryId);
  if (!updatedDelivery) throw new Error('Failed to update delivery');

  return updatedDelivery;
};
