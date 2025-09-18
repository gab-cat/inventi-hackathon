import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webBulkUpdateAssetsArgs = {
  assetIds: v.array(v.id('assets')),
  updates: v.object({
    status: v.optional(
      v.union(
        v.literal('available'),
        v.literal('checked_out'),
        v.literal('maintenance'),
        v.literal('retired'),
        v.literal('lost')
      )
    ),
    condition: v.optional(
      v.union(v.literal('excellent'), v.literal('good'), v.literal('fair'), v.literal('poor'), v.literal('broken'))
    ),
    location: v.optional(v.string()),
  }),
  notes: v.optional(v.string()),
} as const;

export const webBulkUpdateAssetsReturns = v.null();

type Args = {
  assetIds: Id<'assets'>[];
  updates: {
    status?: 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';
    condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
    location?: string;
  };
  notes?: string;
};

export const webBulkUpdateAssetsHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  const now = Date.now();

  for (const assetId of args.assetIds) {
    const asset = await ctx.db.get(assetId);
    if (!asset) continue;

    const property = await ctx.db.get(asset.propertyId);
    if (!property || property.managerId !== currentUser._id) continue;

    const updateData: any = { updatedAt: now };
    if (args.updates.status) updateData.status = args.updates.status;
    if (args.updates.condition) updateData.condition = args.updates.condition;
    if (args.updates.location) updateData.location = args.updates.location;

    await ctx.db.patch(assetId, updateData);

    await ctx.db.insert('assetHistory', {
      assetId,
      propertyId: asset.propertyId,
      action: 'bulk_update',
      notes: args.notes || 'Bulk update applied',
      timestamp: now,
      performedBy: currentUser._id,
    });
  }

  return null;
};
