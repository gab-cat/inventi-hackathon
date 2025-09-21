import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webSearchVisitorHistoryArgs = {
  propertyId: v.id('properties'),
  searchTerm: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  status: v.optional(v.string()),
  limit: v.optional(v.number()),
} as const;

export const webSearchVisitorHistoryReturns = v.array(
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
    approvedByUser: v.optional(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      })
    ),
    logs: v.optional(
      v.array(
        v.object({
          _id: v.id('visitorLogs'),
          action: v.string(),
          timestamp: v.number(),
          location: v.optional(v.string()),
          notes: v.optional(v.string()),
        })
      )
    ),
  })
);

type Args = {
  propertyId: Id<'properties'>;
  searchTerm?: string;
  startDate?: number;
  endDate?: number;
  status?: string;
  limit?: number;
};

export const webSearchVisitorHistoryHandler = async (ctx: QueryCtx, args: Args) => {
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
    throw new Error('Only managers can search visitor history');
  }

  // Get all visitor requests for the property
  let requests = await ctx.db
    .query('visitorRequests')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  // Apply filters
  if (args.searchTerm) {
    const searchLower = args.searchTerm.toLowerCase();
    requests = requests.filter(
      request =>
        request.visitorName.toLowerCase().includes(searchLower) ||
        request.visitorEmail?.toLowerCase().includes(searchLower) ||
        request.visitorPhone?.includes(args.searchTerm!) ||
        request.purpose.toLowerCase().includes(searchLower)
    );
  }

  if (args.status) {
    requests = requests.filter(request => request.status === args.status);
  }

  if (args.startDate && args.endDate) {
    requests = requests.filter(
      request => request.expectedArrival >= args.startDate! && request.expectedArrival <= args.endDate!
    );
  }

  // Sort by creation date descending
  requests.sort((a, b) => b.createdAt - a.createdAt);

  // Limit results
  const limitedRequests = requests.slice(0, args.limit || 100);

  // Get related data
  const requestsWithDetails = await Promise.all(
    limitedRequests.map(async request => {
      const unit = await ctx.db.get(request.unitId);
      const requestedBy = await ctx.db.get(request.requestedBy);
      const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;

      // Get visitor logs for this request
      const logs = await ctx.db
        .query('visitorLogs')
        .withIndex('by_visitor_request', q => q.eq('visitorRequestId', request._id))
        .collect();

      return {
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
        approvedByUser: approvedBy
          ? {
              _id: approvedBy._id,
              firstName: approvedBy.firstName,
              lastName: approvedBy.lastName,
              email: approvedBy.email,
            }
          : null,
        logs: logs.map(log => ({
          _id: log._id,
          action: log.action,
          timestamp: log.timestamp,
          location: log.location,
          notes: log.notes,
        })),
      };
    })
  );

  return requestsWithDetails;
};
