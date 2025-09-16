import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getTechnicianWorkloadArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const getTechnicianWorkloadReturns = v.array(
  v.object({
    userId: v.id('users'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    activeAssignments: v.number(),
  })
);

export const getTechnicianWorkloadHandler = async (ctx: QueryCtx, args: { propertyId?: Id<'properties'> }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // list all technicians
  const techs = await ctx.db
    .query('users')
    .withIndex('by_role', q => q.eq('role', 'field_technician'))
    .collect();

  // active assignments per technician
  const results: Array<{ userId: Id<'users'>; firstName?: string; lastName?: string; activeAssignments: number }> = [];
  for (const t of techs) {
    let rq = ctx.db.query('maintenanceRequests').withIndex('by_assigned_to', q => q.eq('assignedTo', t._id));
    if (args.propertyId) rq = rq.filter(f => f.eq(f.field('propertyId'), args.propertyId!));
    rq = rq
      .filter(f => f.neq(f.field('status'), 'completed'))
      .filter(f => f.neq(f.field('status'), 'cancelled'))
      .filter(f => f.neq(f.field('status'), 'rejected'));
    const count = (await rq.collect()).length;
    results.push({ userId: t._id, firstName: t.firstName, lastName: t.lastName, activeAssignments: count });
  }
  return results;
};
