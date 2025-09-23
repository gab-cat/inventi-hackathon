import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileGetMyVisitorsArgs = v.object({
  status: v.optional(
    v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('denied'),
      v.literal('cancelled'),
      v.literal('expired')
    )
  ),
  limit: v.optional(v.number()),
});

export const mobileGetMyVisitorsReturns = v.object({
  success: v.boolean(),
  visitors: v.array(
    v.object({
      _id: v.id('visitorRequests'),
      _creationTime: v.number(),
      requestedBy: v.id('users'),
      visitorIdNumber: v.optional(v.string()),
      visitorIdType: v.optional(v.string()),
      updatedAt: v.number(),
      visitorName: v.string(),
      visitorEmail: v.optional(v.string()),
      visitorPhone: v.optional(v.string()),
      purpose: v.string(),
      expectedArrival: v.number(),
      expectedDeparture: v.optional(v.number()),
      numberOfVisitors: v.number(),
      status: v.string(),
      propertyId: v.id('properties'),
      unitId: v.id('units'),
      createdAt: v.number(),
      approvedAt: v.optional(v.number()),
      documents: v.optional(
        v.array(
          v.object({
            fileName: v.string(),
            fileUrl: v.string(),
            uploadedAt: v.number(),
          })
        )
      ),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileGetMyVisitorsHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetMyVisitorsArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, visitors: [], message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, visitors: [], message: 'User not found' };
  }

  // Get all units for user's properties
  const userUnits = await ctx.db
    .query('units')
    .filter(q => q.eq(q.field('tenantId'), me._id))
    .collect();

  const unitIds = userUnits.map(unit => unit._id);

  // Build query for visitor requests - order first, then filter
  let query = ctx.db.query('visitorRequests').order('desc');

  // Filter by user's units
  if (unitIds.length > 0) {
    query = query.filter(q => unitIds.some(unitId => q.eq(q.field('unitId'), unitId)));
  }

  // Filter by status if provided
  if (args.status) {
    query = query.filter(q => q.eq(q.field('status'), args.status));
  }

  // Apply limit if provided
  if (args.limit) {
    const results = await query.take(args.limit);
    return { success: true, visitors: results };
  } else {
    const results = await query.collect();
    return { success: true, visitors: results };
  }
};
