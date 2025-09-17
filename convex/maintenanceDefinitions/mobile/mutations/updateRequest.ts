import { MutationCtx } from '../../../_generated/server';
import { Doc, Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const updateRequestArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('emergency'))),
  location: v.optional(v.string()),
  photos: v.optional(v.array(v.string())),
  status: v.optional(
    v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    )
  ), // allow assignee/manager to change
  assignedTo: v.optional(v.id('users')), // allow manager to reassign
});

export const updateRequestHandler = async (ctx: MutationCtx, args: Infer<typeof updateRequestArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { success: false, message: 'User not authenticated' };

  const request = await ctx.db.get(args.requestId);
  if (!request) return { success: false, message: 'Request not found' };

  const me = identity._id as Id<'users'>;
  const isRequester = request.requestedBy === me;
  const isAssignee = request.assignedTo === me;

  const rel = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', me).eq('propertyId', request.propertyId))
    .first();
  const isManager = !!rel && rel.role === 'manager';

  // Permissions: requester can edit description/title/location/photos/priority if not completed
  // assignee can move status to in_progress/completed; manager can reassign or change any status
  if (!(isRequester || isAssignee || isManager)) {
    return { success: false, message: 'Not authorized' };
  }

  const patch: Partial<Doc<'maintenanceRequests'>> = { updatedAt: Date.now() };
  if (isRequester) {
    if (request.status === 'completed') {
      return { success: false, message: 'Completed requests cannot be edited' };
    }
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.location !== undefined) patch.location = args.location;
    if (args.photos !== undefined) patch.photos = args.photos;
  }

  if (isAssignee || isManager) {
    if (args.status !== undefined) patch.status = args.status;
  }
  if (isManager && args.assignedTo !== undefined) {
    patch.assignedTo = args.assignedTo;
    patch.assignedAt = Date.now();
  }

  await ctx.db.patch(args.requestId, patch);

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: patch.status ?? request.status,
    description: 'Request updated',
    updatedBy: me,
    timestamp: Date.now(),
  });

  return { success: true };
};
