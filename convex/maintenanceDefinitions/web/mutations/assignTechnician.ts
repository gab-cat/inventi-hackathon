import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const assignTechnicianArgs = {
  requestId: v.id('maintenanceRequests'),
  technicianId: v.id('users'),
} as const;

export const assignTechnicianHandler = async (
  ctx: MutationCtx,
  args: { requestId: Id<'maintenanceRequests'>; technicianId: Id<'users'> }
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

  const technician = await ctx.db.get(args.technicianId);
  if (!technician || technician.role !== 'field_technician') throw new Error('Invalid technician');

  await ctx.db.patch(args.requestId, {
    assignedTo: args.technicianId,
    assignedAt: Date.now(),
    status: 'assigned',
    updatedAt: Date.now(),
  });

  // Optionally create a maintenance update timeline entry
  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: 'assigned',
    description: `Assigned to ${technician.firstName ?? ''} ${technician.lastName ?? ''}`.trim(),
    updatedBy: currentUser._id,
    timestamp: Date.now(),
  });
};
