import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webExportVisitorReportsArgs = {
  propertyId: v.id('properties'),
  startDate: v.number(),
  endDate: v.number(),
  reportType: v.union(v.literal('summary'), v.literal('detailed'), v.literal('security')),
} as const;

export const webExportVisitorReportsReturns = v.object({
  property: v.optional(
    v.object({
      _id: v.id('properties'),
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
    })
  ),
  period: v.object({
    start: v.number(),
    end: v.number(),
  }),
  summary: v.optional(
    v.object({
      totalRequests: v.number(),
      approvedRequests: v.number(),
      deniedRequests: v.number(),
      pendingRequests: v.number(),
      totalCheckIns: v.number(),
      totalCheckOuts: v.number(),
      noShows: v.number(),
    })
  ),
  requests: v.optional(v.array(v.any())),
  securityLogs: v.optional(v.array(v.any())),
});

type Args = {
  propertyId: Id<'properties'>;
  startDate: number;
  endDate: number;
  reportType: 'summary' | 'detailed' | 'security';
};

export const webExportVisitorReportsHandler = async (ctx: QueryCtx, args: Args) => {
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
    throw new Error('Only managers can export visitor reports');
  }

  // Get visitor requests within date range
  const requests = await ctx.db
    .query('visitorRequests')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  const filteredRequests = requests.filter(
    request => request.expectedArrival >= args.startDate && request.expectedArrival <= args.endDate
  );

  // Get visitor logs for the same period
  const logs = await ctx.db
    .query('visitorLogs')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  const filteredLogs = logs.filter(log => log.timestamp >= args.startDate && log.timestamp <= args.endDate);

  // Get property details
  const property = await ctx.db.get(args.propertyId);

  // Generate report based on type
  let reportData;

  switch (args.reportType) {
    case 'summary':
      reportData = {
        property: property,
        period: {
          start: args.startDate,
          end: args.endDate,
        },
        summary: {
          totalRequests: filteredRequests.length,
          approvedRequests: filteredRequests.filter(r => r.status === 'approved').length,
          deniedRequests: filteredRequests.filter(r => r.status === 'denied').length,
          pendingRequests: filteredRequests.filter(r => r.status === 'pending').length,
          totalCheckIns: filteredLogs.filter(l => l.action === 'check_in').length,
          totalCheckOuts: filteredLogs.filter(l => l.action === 'check_out').length,
          noShows: filteredLogs.filter(l => l.action === 'no_show').length,
        },
        requests: filteredRequests,
      };
      break;

    case 'detailed':
      const detailedRequests = await Promise.all(
        filteredRequests.map(async request => {
          const unit = await ctx.db.get(request.unitId);
          const requestedBy = await ctx.db.get(request.requestedBy);
          const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
          const requestLogs = filteredLogs.filter(l => l.visitorRequestId === request._id);

          return {
            ...request,
            unit,
            requestedBy,
            approvedBy,
            logs: requestLogs,
          };
        })
      );

      reportData = {
        property: property,
        period: {
          start: args.startDate,
          end: args.endDate,
        },
        requests: detailedRequests,
      };
      break;

    case 'security':
      const securityLogs = await Promise.all(
        filteredLogs.map(async log => {
          const visitorRequest = await ctx.db.get(log.visitorRequestId);
          const unit = await ctx.db.get(log.unitId);
          const verifiedBy = log.verifiedBy ? await ctx.db.get(log.verifiedBy) : null;

          return {
            ...log,
            visitorRequest,
            unit,
            verifiedBy,
          };
        })
      );

      reportData = {
        property: property,
        period: {
          start: args.startDate,
          end: args.endDate,
        },
        securityLogs: securityLogs,
        summary: {
          totalLogEntries: securityLogs.length,
          checkIns: securityLogs.filter(l => l.action === 'check_in').length,
          checkOuts: securityLogs.filter(l => l.action === 'check_out').length,
          noShows: securityLogs.filter(l => l.action === 'no_show').length,
        },
      };
      break;
  }

  return reportData;
};
