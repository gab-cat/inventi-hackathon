import { v } from 'convex/values';
import { Id } from '../../../_generated/dataModel';
import { QueryCtx } from '../../../_generated/server';

export const webGetUsersByPropertyAndUnitArgs = {
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')),
} as const;

export const webGetUsersByPropertyAndUnitReturns = v.array(
  v.object({
    _id: v.id('users'),
    _creationTime: v.number(),
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal('manager'), v.literal('field_technician'), v.literal('tenant'), v.literal('vendor')),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Additional info for display
    fullName: v.string(),
    unitNumber: v.optional(v.string()),
  })
);

type Args = {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
};

export const webGetUsersByPropertyAndUnitHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Verify property access
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Get all units in the property
  const units = await ctx.db
    .query('units')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  // Filter units if specific unit is requested
  const targetUnits = args.unitId ? units.filter(unit => unit._id === args.unitId) : units;

  // Get all users who are tenants in these units
  const users = await Promise.all(
    targetUnits.map(async unit => {
      if (unit.tenantId) {
        const user = await ctx.db.get(unit.tenantId);
        if (user && user.isActive) {
          return {
            ...user,
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            unitNumber: unit.unitNumber,
          };
        }
      }
      return null;
    })
  );

  // Filter out null values
  const validUsers = users.filter((user): user is NonNullable<typeof user> => user !== null);

  // Deduplicate users by ID, keeping the first occurrence
  const uniqueUsers = validUsers.reduce(
    (acc, user) => {
      if (!acc.find(u => u._id === user._id)) {
        acc.push(user);
      }
      return acc;
    },
    [] as typeof validUsers
  );

  return uniqueUsers;
};
