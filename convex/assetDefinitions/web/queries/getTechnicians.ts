import { v } from 'convex/values';
import { query, QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webGetTechniciansArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const webGetTechniciansReturns = v.array(
  v.object({
    _id: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.string(),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
  })
);

export const webGetTechniciansHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Get all users with field_technician role
  const technicians: Doc<'users'>[] = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('role'), 'field_technician'))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // If propertyId is provided, filter technicians who have access to that property
  if (args.propertyId) {
    // For now, we'll return all active field technicians
    // In a more complex system, you might want to check property-specific access
    return technicians.map(tech => ({
      _id: tech._id,
      firstName: tech.firstName,
      lastName: tech.lastName,
      email: tech.email,
      role: tech.role,
      phone: tech.phone,
      isActive: tech.isActive,
    }));
  }

  return technicians.map(tech => ({
    _id: tech._id,
    firstName: tech.firstName,
    lastName: tech.lastName,
    email: tech.email,
    role: tech.role,
    phone: tech.phone,
    isActive: tech.isActive,
  }));
};

export const webGetTechnicians = query({
  args: webGetTechniciansArgs,
  returns: webGetTechniciansReturns,
  handler: webGetTechniciansHandler,
});

type Args = {
  propertyId?: Id<'properties'>;
};
