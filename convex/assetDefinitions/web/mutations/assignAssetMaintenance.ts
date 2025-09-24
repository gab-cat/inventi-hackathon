import { v } from 'convex/values';
import { mutation, MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webAssignAssetMaintenanceArgs = {
  assetId: v.id('assets'),
  technicianId: v.id('users'),
  scheduledDate: v.optional(v.number()),
  notes: v.optional(v.string()),
} as const;

export const webAssignAssetMaintenanceHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Get the asset
  const asset = await ctx.db.get(args.assetId);
  if (!asset) throw new Error('Asset not found');

  // Get the technician
  const technician = await ctx.db.get(args.technicianId);
  if (!technician || technician.role !== 'field_technician') {
    throw new Error('Invalid technician');
  }

  // Create a maintenance request for the asset
  const maintenanceRequestId = await ctx.db.insert('maintenanceRequests', {
    propertyId: asset.propertyId,
    unitId: undefined, // Asset maintenance doesn't require a unit
    requestedBy: currentUser._id,
    assignedTo: args.technicianId,
    title: `Scheduled Maintenance - ${asset.name}`,
    description: `Scheduled maintenance for asset: ${asset.name} (${asset.assetTag})${args.notes ? `\n\nNotes: ${args.notes}` : ''}`,
    priority: 'medium',
    status: 'assigned',
    requestType: 'general',
    location: asset.location,
    estimatedCost: undefined,
    actualCost: undefined,
    estimatedCompletion: args.scheduledDate || asset.maintenanceSchedule?.nextMaintenance || Date.now(),
    assignedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Update the asset's maintenance schedule
  if (asset.maintenanceSchedule) {
    const nextMaintenanceDate = args.scheduledDate || asset.maintenanceSchedule.nextMaintenance || Date.now();
    const newNextMaintenance = nextMaintenanceDate + asset.maintenanceSchedule.interval * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.assetId, {
      maintenanceSchedule: {
        ...asset.maintenanceSchedule,
        lastMaintenance: nextMaintenanceDate,
        nextMaintenance: newNextMaintenance,
      },
      updatedAt: Date.now(),
    });
  }

  // Create a maintenance update timeline entry
  await ctx.db.insert('maintenanceUpdates', {
    requestId: maintenanceRequestId,
    propertyId: asset.propertyId,
    status: 'assigned',
    description: `Asset maintenance assigned to ${technician.firstName} ${technician.lastName}`,
    updatedBy: currentUser._id,
    timestamp: Date.now(),
  });

  return maintenanceRequestId;
};

export const webAssignAssetMaintenance = mutation({
  args: webAssignAssetMaintenanceArgs,
  returns: v.id('maintenanceRequests'),
  handler: webAssignAssetMaintenanceHandler,
});

type Args = {
  assetId: Id<'assets'>;
  technicianId: Id<'users'>;
  scheduledDate?: number;
  notes?: string;
};
