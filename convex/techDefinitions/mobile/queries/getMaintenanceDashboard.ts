import { QueryCtx } from '../../../_generated/server';
import { v } from 'convex/values';

export const getMaintenanceDashboardArgs = v.object({});

export const getMaintenanceDashboardReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  data: v.optional(
    v.object({
      assignedRequests: v.array(
        v.object({
          _id: v.id('maintenanceRequests'),
          title: v.string(),
          description: v.string(),
          priority: v.string(),
          status: v.string(),
          estimatedCompletion: v.optional(v.number()),
          createdAt: v.number(),
          propertyName: v.string(),
          unitNumber: v.optional(v.string()),
          requestType: v.string(),
        })
      ),
      priorityCounts: v.object({
        emergency: v.number(),
        high: v.number(),
        medium: v.number(),
        low: v.number(),
      }),
      overdueCount: v.number(),
      todaysCount: v.number(),
      thisWeekCount: v.number(),
    })
  ),
});

export const getMaintenanceDashboardHandler = async (ctx: QueryCtx) => {
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

  if (me.role !== 'field_technician') {
    return { success: false, message: 'Access denied. Field technician role required.' };
  }

  // Get assigned requests
  const assignedRequests = await ctx.db
    .query('maintenanceRequests')
    .withIndex('by_assigned_to', q => q.eq('assignedTo', me._id))
    .filter(q => q.neq(q.field('status'), 'completed'))
    .filter(q => q.neq(q.field('status'), 'cancelled'))
    .collect();

  // Get property and unit information for each request
  const enrichedRequests = await Promise.all(
    assignedRequests.map(async request => {
      const property = await ctx.db.get(request.propertyId);
      const unit = request.unitId ? await ctx.db.get(request.unitId) : null;

      return {
        _id: request._id,
        title: request.title,
        description: request.description,
        priority: request.priority,
        status: request.status,
        estimatedCompletion: request.estimatedCompletion,
        createdAt: request.createdAt,
        propertyName: property?.name || 'Unknown Property',
        unitNumber: unit?.unitNumber,
        requestType: request.requestType,
      };
    })
  );

  // Calculate priority counts
  const priorityCounts = {
    emergency: assignedRequests.filter(r => r.priority === 'emergency').length,
    high: assignedRequests.filter(r => r.priority === 'high').length,
    medium: assignedRequests.filter(r => r.priority === 'medium').length,
    low: assignedRequests.filter(r => r.priority === 'low').length,
  };

  // Calculate overdue, today, and this week counts
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const weekFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000);
  weekFromNow.setHours(23, 59, 59, 999);
  const weekTimestamp = weekFromNow.getTime();

  const overdueCount = assignedRequests.filter(r => r.estimatedCompletion && r.estimatedCompletion < now).length;

  const todaysCount = assignedRequests.filter(
    r =>
      r.estimatedCompletion &&
      r.estimatedCompletion >= todayTimestamp &&
      r.estimatedCompletion < todayTimestamp + 24 * 60 * 60 * 1000
  ).length;

  const thisWeekCount = assignedRequests.filter(
    r => r.estimatedCompletion && r.estimatedCompletion >= todayTimestamp && r.estimatedCompletion <= weekTimestamp
  ).length;

  return {
    success: true,
    data: {
      assignedRequests: enrichedRequests,
      priorityCounts,
      overdueCount,
      todaysCount,
      thisWeekCount,
    },
  };
};
