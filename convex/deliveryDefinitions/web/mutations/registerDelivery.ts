import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webRegisterDeliveryArgs = {
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')), // Optional for common area deliveries
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
  deliveryLocation: v.optional(v.string()), // "unit", "lobby", "mailroom", "storage"
  deliveryNotes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())), // Photo URLs
} as const;

export const webRegisterDeliveryReturns = v.object({
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
});

type Args = {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  deliveryType: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  senderName: string;
  senderCompany?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  trackingNumber?: string;
  description: string;
  estimatedDelivery: number;
  deliveryLocation?: string;
  deliveryNotes?: string;
  photos?: string[];
};

export const webRegisterDeliveryHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify property exists and user has access to it
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Verify unit exists and belongs to the property (if specified)
  if (args.unitId) {
    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error('Unit not found');
    if (unit.propertyId !== args.propertyId) throw new Error('Unit does not belong to the specified property');
  }

  // Validate estimated delivery time
  const now = Date.now();
  if (args.estimatedDelivery <= now) {
    throw new Error('Estimated delivery time must be in the future');
  }

  // Create the delivery
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
    notes: `Delivery registered by ${currentUser.firstName} ${currentUser.lastName}`,
    createdAt: now,
  });

  // Return the created delivery
  const createdDelivery = await ctx.db.get(deliveryId);
  if (!createdDelivery) throw new Error('Failed to create delivery');

  return createdDelivery;
};
