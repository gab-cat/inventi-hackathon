import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetActiveVisitorsArgs = {
  propertyId: v.id('properties'),
} as const;

export const webGetActiveVisitorsReturns = v.array(
  v.object({
    _id: v.id('visitorRequests'),
    propertyId: v.id('properties'),
    unitId: v.id('units'),
    requestedBy: v.id('users'),
    visitorName: v.string(),
    visitorEmail: v.optional(v.string()),
    visitorPhone: v.optional(v.string()),
    visitorIdNumber: v.optional(v.string()),
    visitorIdType: v.optional(v.string()),
    purpose: v.string(),
    expectedArrival: v.number(),
    expectedDeparture: v.optional(v.number()),
    numberOfVisitors: v.number(),
    status: v.string(),
    approvedBy: v.optional(v.id('users')),
    approvedAt: v.optional(v.number()),
    deniedReason: v.optional(v.string()),
    documents: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          fileUrl: v.string(),
          uploadedAt: v.number(),
        })
      )
    ),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
        propertyId: v.id('properties'),
      })
    ),
    requestedByUser: v.optional(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      })
    ),
    checkInTime: v.number(),
    checkInLocation: v.optional(v.string()),
  })
);

type Args = {
  propertyId: Id<'properties'>;
};

export const webGetActiveVisitorsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'manager') {
    throw new Error('Only managers can view active visitors');
  }

  // Get approved visitor requests that haven't expired
  const approvedRequests = await ctx.db
    .query('visitorRequests')
    .withIndex('by_property_status', q => q.eq('propertyId', args.propertyId).eq('status', 'approved'))
    .collect();

  const currentTime = Date.now();
  const activeVisitors = [];

  for (const request of approvedRequests) {
    // Check if visitor is currently within their expected time window
    const isWithinTimeWindow =
      currentTime >= request.expectedArrival &&
      (!request.expectedDeparture || currentTime <= request.expectedDeparture);

    if (isWithinTimeWindow) {
      // Check if visitor has checked in but not checked out
      const checkInLog = await ctx.db
        .query('visitorLogs')
        .withIndex('by_visitor_request', q => q.eq('visitorRequestId', request._id))
        .filter(q => q.eq(q.field('action'), 'check_in'))
        .first();

      const checkOutLog = await ctx.db
        .query('visitorLogs')
        .withIndex('by_visitor_request', q => q.eq('visitorRequestId', request._id))
        .filter(q => q.eq(q.field('action'), 'check_out'))
        .first();

      // Visitor is active if they've checked in but not checked out
      if (checkInLog && !checkOutLog) {
        const unit = await ctx.db.get(request.unitId);
        const requestedBy = await ctx.db.get(request.requestedBy);

        activeVisitors.push({
          ...request,
          unit: unit
            ? {
                _id: unit._id,
                unitNumber: unit.unitNumber,
                propertyId: unit.propertyId,
              }
            : null,
          requestedByUser: requestedBy
            ? {
                _id: requestedBy._id,
                firstName: requestedBy.firstName,
                lastName: requestedBy.lastName,
                email: requestedBy.email,
              }
            : null,
          checkInTime: checkInLog.timestamp,
          checkInLocation: checkInLog.location,
        });
      }
    }
  }

  return activeVisitors;
};
