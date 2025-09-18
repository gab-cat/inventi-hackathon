import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetTechniciansArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const webGetTechniciansReturns = v.array(
  v.object({
    _id: v.id('users'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
  })
);

export const webGetTechniciansHandler = async (ctx: QueryCtx, args: { propertyId?: Id<'properties'> }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get all field technicians
  const technicians = await ctx.db
    .query('users')
    .withIndex('by_role', q => q.eq('role', 'field_technician'))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // If propertyId is specified, filter by technicians assigned to that property
  if (args.propertyId) {
    const userProperties = await ctx.db
      .query('userProperties')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('role'), 'field_technician'))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect();

    const assignedTechnicianIds = new Set(userProperties.map(up => up.userId));
    const filteredTechnicians = technicians.filter(t => assignedTechnicianIds.has(t._id));

    return filteredTechnicians.map(tech => ({
      _id: tech._id,
      firstName: tech.firstName,
      lastName: tech.lastName,
      email: tech.email,
      phone: tech.phone,
      isActive: tech.isActive,
    }));
  }

  return technicians.map(tech => ({
    _id: tech._id,
    firstName: tech.firstName,
    lastName: tech.lastName,
    email: tech.email,
    phone: tech.phone,
    isActive: tech.isActive,
  }));
};
