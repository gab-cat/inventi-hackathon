import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webScheduleMaintenanceArgs = {
  assetId: v.id('assets'),
  scheduledDate: v.number(),
  notes: v.optional(v.string()),
} as const;

export const webScheduleMaintenanceReturns = v.null();

type Args = {
  assetId: Id<'assets'>;
  scheduledDate: number;
  notes?: string;
};

export const webScheduleMaintenanceHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  const asset = await ctx.db.get(args.assetId);
  if (!asset) throw new Error('Asset not found');

  const property = await ctx.db.get(asset.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  const now = Date.now();

  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'maintenance_scheduled',
    notes: args.notes || `Maintenance scheduled for ${new Date(args.scheduledDate).toLocaleDateString()}`,
    timestamp: now,
    performedBy: currentUser._id,
  });

  return null;
};
