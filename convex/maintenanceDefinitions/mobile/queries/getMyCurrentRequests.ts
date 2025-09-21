import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getMyCurrentRequestsArgs = v.object({
  statusFilter: v.optional(
    v.union(
      v.literal('all'),
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    )
  ),
  searchQuery: v.optional(v.string()),
});

export const getMyCurrentRequestsHandler = async (ctx: QueryCtx, args: Infer<typeof getMyCurrentRequestsArgs>) => {
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

  // Get all user's requests
  let requests = await ctx.db
    .query('maintenanceRequests')
    .withIndex('by_requested_by', q => q.eq('requestedBy', me._id))
    .collect();

  // Apply status filter
  if (args.statusFilter && args.statusFilter !== 'all') {
    // Filter for specific status
    requests = requests.filter(req => req.status === args.statusFilter);
  } else if (!args.statusFilter) {
    // Default behavior when no filter is provided: show active requests only
    const excludedStatuses: readonly string[] = ['completed', 'cancelled', 'rejected'];
    requests = requests.filter(r => !excludedStatuses.includes(r.status));
  }
  // If statusFilter is 'all', don't filter anything - show all requests

  // Apply search filter
  if (args.searchQuery && args.searchQuery.trim()) {
    const searchTerm = args.searchQuery.toLowerCase().trim();
    requests = requests.filter(
      req =>
        req.title.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.location.toLowerCase().includes(searchTerm)
    );
  }

  return { success: true, requests };
};
