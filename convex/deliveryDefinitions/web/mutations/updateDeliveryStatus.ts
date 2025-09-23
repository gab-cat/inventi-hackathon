import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webUpdateDeliveryStatusArgs = {
  deliveryId: v.id('deliveries'),
  status: v.union(
    v.literal('registered'),
    v.literal('arrived'),
    v.literal('collected'),
    v.literal('failed'),
    v.literal('returned')
  ),
  notes: v.optional(v.string()),
  actualDelivery: v.optional(v.number()),
} as const;

export const webUpdateDeliveryStatusReturns = v.object({
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
  status: v.union(
    v.literal('registered'),
    v.literal('arrived'),
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
});

type Args = {
  deliveryId: Id<'deliveries'>;
  status: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  notes?: string;
  actualDelivery?: number;
};

export const webUpdateDeliveryStatusHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    registered: ['arrived', 'failed', 'returned'],
    arrived: ['collected', 'failed', 'returned'],
    collected: [], // Final state
    failed: ['registered', 'returned'],
    returned: [], // Final state
  };

  if (!validTransitions[delivery.status]?.includes(args.status)) {
    throw new Error(`Invalid status transition from ${delivery.status} to ${args.status}`);
  }

  const now = Date.now();

  // Prepare update data
  const updateData: any = {
    status: args.status,
    updatedAt: now,
  };

  // Set actual delivery time if provided or if status is arrived/collected
  if (args.actualDelivery) {
    updateData.actualDelivery = args.actualDelivery;
  } else if (['arrived', 'collected'].includes(args.status) && !delivery.actualDelivery) {
    updateData.actualDelivery = now;
  }

  // Update the delivery
  await ctx.db.patch(args.deliveryId, updateData);

  // Create delivery log entry
  await ctx.db.insert('deliveryLogs', {
    deliveryId: args.deliveryId,
    propertyId: delivery.propertyId,
    action: args.status === 'arrived' ? 'arrived' : args.status === 'collected' ? 'collected' : 'failed',
    timestamp: now,
    performedBy: currentUser._id,
    notes: args.notes || `Status updated to ${args.status} by ${currentUser.firstName} ${currentUser.lastName}`,
    createdAt: now,
  });

  // Return the updated delivery
  const updatedDelivery = await ctx.db.get(args.deliveryId);
  if (!updatedDelivery) throw new Error('Failed to update delivery');

  return updatedDelivery;
};
