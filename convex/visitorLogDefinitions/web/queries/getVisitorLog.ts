import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetVisitorLogArgs = {
  propertyId: v.id('properties'),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  limit: v.optional(v.number()),
} as const;

export const webGetVisitorLogReturns = v.array(
  v.object({
    _id: v.id('visitorLogs'),
    visitorRequestId: v.id('visitorRequests'),
    propertyId: v.id('properties'),
    unitId: v.id('units'),
    visitorName: v.string(),
    action: v.string(),
    timestamp: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    blockchainTxHash: v.string(),
    blockNumber: v.optional(v.number()),
    smartContractAddress: v.optional(v.string()),
    createdAt: v.number(),
    // Joined data
    visitorRequest: v.union(
      v.object({
        _id: v.id('visitorRequests'),
        visitorName: v.string(),
        purpose: v.string(),
        expectedArrival: v.number(),
        expectedDeparture: v.optional(v.number()),
        status: v.string(),
      }),
      v.null()
    ),
    unit: v.union(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
        propertyId: v.id('properties'),
      }),
      v.null()
    ),
    verifiedBy: v.union(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      }),
      v.null()
    ),
  })
);

type Args = {
  propertyId: Id<'properties'>;
  startDate?: number;
  endDate?: number;
  limit?: number;
};

export const webGetVisitorLogHandler = async (ctx: QueryCtx, args: Args) => {
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
    throw new Error('Only managers can view visitor logs');
  }

  let query = ctx.db.query('visitorLogs').withIndex('by_property', q => q.eq('propertyId', args.propertyId));

  if (args.startDate && args.endDate) {
    // Filter by date range if provided
    const logs = await query.collect();
    const filteredLogs = logs.filter(log => log.timestamp >= args.startDate! && log.timestamp <= args.endDate!);

    // Sort by timestamp descending and limit
    const sortedLogs = filteredLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, args.limit || 100);

    // Get related visitor request details
    const logsWithDetails = await Promise.all(
      sortedLogs.map(async log => {
        const visitorRequest = await ctx.db.get(log.visitorRequestId);
        const unit = await ctx.db.get(log.unitId);
        const verifiedBy = log.verifiedBy ? await ctx.db.get(log.verifiedBy) : null;

        return {
          ...log,
          visitorRequest: visitorRequest
            ? {
                _id: visitorRequest._id,
                visitorName: visitorRequest.visitorName,
                purpose: visitorRequest.purpose,
                expectedArrival: visitorRequest.expectedArrival,
                expectedDeparture: visitorRequest.expectedDeparture,
                status: visitorRequest.status,
              }
            : null,
          unit: unit
            ? {
                _id: unit._id,
                unitNumber: unit.unitNumber,
                propertyId: unit.propertyId,
              }
            : null,
          verifiedBy: verifiedBy
            ? {
                _id: verifiedBy._id,
                firstName: verifiedBy.firstName,
                lastName: verifiedBy.lastName,
                email: verifiedBy.email,
              }
            : null,
        };
      })
    );

    return logsWithDetails;
  }

  // Get all logs for the property
  const logs = await query.collect();
  const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, args.limit || 100);

  // Get related visitor request details
  const logsWithDetails = await Promise.all(
    sortedLogs.map(async log => {
      const visitorRequest = await ctx.db.get(log.visitorRequestId);
      const unit = await ctx.db.get(log.unitId);
      const verifiedBy = log.verifiedBy ? await ctx.db.get(log.verifiedBy) : null;

      return {
        ...log,
        visitorRequest: visitorRequest
          ? {
              _id: visitorRequest._id,
              visitorName: visitorRequest.visitorName,
              purpose: visitorRequest.purpose,
              expectedArrival: visitorRequest.expectedArrival,
              expectedDeparture: visitorRequest.expectedDeparture,
              status: visitorRequest.status,
            }
          : null,
        unit: unit
          ? {
              _id: unit._id,
              unitNumber: unit.unitNumber,
              propertyId: unit.propertyId,
            }
          : null,
        verifiedBy: verifiedBy
          ? {
              _id: verifiedBy._id,
              firstName: verifiedBy.firstName,
              lastName: verifiedBy.lastName,
              email: verifiedBy.email,
            }
          : null,
      };
    })
  );

  return logsWithDetails;
};
