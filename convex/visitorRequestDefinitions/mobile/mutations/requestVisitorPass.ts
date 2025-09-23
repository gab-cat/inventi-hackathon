import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileRequestVisitorPassArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.id('units'),
  visitorName: v.string(),
  visitorEmail: v.optional(v.string()),
  visitorPhone: v.optional(v.string()),
  visitorIdNumber: v.optional(v.string()),
  visitorIdType: v.optional(
    v.union(v.literal('driver_license'), v.literal('passport'), v.literal('national_id'), v.literal('others'))
  ),
  purpose: v.string(),
  expectedArrival: v.number(), // Timestamp
  expectedDeparture: v.optional(v.number()),
  numberOfVisitors: v.number(),
  documents: v.optional(
    v.array(
      v.object({
        fileName: v.string(),
        storageId: v.optional(v.id('_storage')),
        fileUrl: v.string(),
        uploadedAt: v.number(),
      })
    )
  ),
});

export const mobileRequestVisitorPassReturns = v.object({
  success: v.boolean(),
  requestId: v.optional(v.id('visitorRequests')),
  message: v.optional(v.string()),
});

export const mobileRequestVisitorPassHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileRequestVisitorPassArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Check visitor limit per unit
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    return { success: false, message: 'Property not found' };
  }

  const unit = await ctx.db.get(args.unitId);
  if (!unit) {
    return { success: false, message: 'Unit not found' };
  }

  // Check visitor limit
  const visitorLimitPerUnit = property.settings?.visitorLimitPerUnit;
  if (visitorLimitPerUnit) {
    const activeVisitors = await ctx.db
      .query('visitorRequests')
      .filter(q => q.eq(q.field('unitId'), args.unitId))
      .filter(q => q.eq(q.field('status'), 'approved'))
      .collect();

    const totalActiveVisitors = activeVisitors.reduce((sum, req) => sum + req.numberOfVisitors, 0);
    if (totalActiveVisitors + args.numberOfVisitors > visitorLimitPerUnit) {
      return {
        success: false,
        message: `Visitor limit exceeded. Maximum ${visitorLimitPerUnit} visitors allowed per unit.`,
      };
    }
  }

  const now = Date.now();

  // Create visitor request
  const requestId = await ctx.db.insert('visitorRequests', {
    propertyId: args.propertyId,
    unitId: args.unitId,
    requestedBy: me._id,
    visitorName: args.visitorName,
    visitorEmail: args.visitorEmail,
    visitorPhone: args.visitorPhone,
    visitorIdNumber: args.visitorIdNumber,
    visitorIdType: args.visitorIdType,
    purpose: args.purpose,
    expectedArrival: args.expectedArrival,
    expectedDeparture: args.expectedDeparture,
    numberOfVisitors: args.numberOfVisitors,
    documents: args.documents,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    requestId,
    message: 'Visitor pass request submitted for approval',
  };
};
