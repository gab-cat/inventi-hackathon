import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const bulkUpdateStatusArgs = {
  requestIds: v.array(v.id('maintenanceRequests')),
  status: v.string(),
  note: v.optional(v.string()),
} as const;

export const bulkUpdateStatusHandler = async (
  ctx: MutationCtx,
  args: { requestIds: Id<'maintenanceRequests'>[]; status: string; note?: string }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  for (const id of args.requestIds) {
    const req = await ctx.db.get(id);
    if (!req) continue;
    const patch: any = { status: args.status, updatedAt: Date.now() };
    if (args.status === 'completed') patch.actualCompletion = Date.now();
    await ctx.db.patch(id, patch);
    await ctx.db.insert('maintenanceUpdates', {
      requestId: id,
      propertyId: req.propertyId,
      status: args.status,
      description: args.note ?? `Bulk status set to ${args.status}`,
      updatedBy: currentUser._id,
      timestamp: Date.now(),
    });
  }
};
