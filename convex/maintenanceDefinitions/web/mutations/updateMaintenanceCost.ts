import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webUpdateMaintenanceCostArgs = {
  requestId: v.id('maintenanceRequests'),
  estimatedCost: v.optional(v.number()),
  actualCost: v.optional(v.number()),
  note: v.optional(v.string()),
} as const;

export const webUpdateMaintenanceCostHandler = async (
  ctx: MutationCtx,
  args: { requestId: Id<'maintenanceRequests'>; estimatedCost?: number; actualCost?: number; note?: string }
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

  const patch: any = { updatedAt: Date.now() };
  if (typeof args.estimatedCost === 'number') patch.estimatedCost = args.estimatedCost;
  if (typeof args.actualCost === 'number') patch.actualCost = args.actualCost;

  await ctx.db.patch(args.requestId, patch);

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: request.status,
    description: args.note ?? 'Cost updated',
    updatedBy: currentUser._id,
    timestamp: Date.now(),
  });
};
