import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const updateMaintenanceStatusArgs = {
  requestId: v.id('maintenanceRequests'),
  status: v.string(),
  note: v.optional(v.string()),
} as const;

export const updateMaintenanceStatusHandler = async (
  ctx: MutationCtx,
  args: { requestId: Id<'maintenanceRequests'>; status: string; note?: string }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  const request = await ctx.db.get(args.requestId);
  if (!request) throw new Error('Request not found');

  const patch: any = { status: args.status, updatedAt: Date.now() };
  if (args.status === 'completed') patch.actualCompletion = Date.now();

  await ctx.db.patch(args.requestId, patch);

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: args.status,
    description: args.note ?? `Status set to ${args.status}`,
    updatedBy: currentUser._id,
    timestamp: Date.now(),
  });
};
