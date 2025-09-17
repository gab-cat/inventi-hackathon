import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const getAllUnitsArgs = {} as const;

export const getAllUnitsReturns = v.array(
  v.object({
    _id: v.id('units'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    unitNumber: v.string(),
    unitType: v.union(
      v.literal('apartment'),
      v.literal('office'),
      v.literal('retail'),
      v.literal('storage'),
      v.literal('condo'),
      v.literal('house')
    ),
    floor: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    rentAmount: v.optional(v.number()),
    tenantId: v.optional(v.id('users')),
    isOccupied: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
    tenant: v.optional(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        profileImage: v.optional(v.string()),
      })
    ),
  })
);

type Args = {};

export const getAllUnitsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get all properties managed by this user
  const properties = await ctx.db
    .query('properties')
    .withIndex('by_manager', q => q.eq('managerId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // Get all units for all managed properties
  const allUnits = [];
  for (const property of properties) {
    const units = await ctx.db
      .query('units')
      .withIndex('by_property', q => q.eq('propertyId', property._id))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect();

    // Enrich with tenant data
    const unitsWithTenants = await Promise.all(
      units.map(async unit => {
        let tenant = undefined;
        if (unit.tenantId) {
          const tenantData = await ctx.db.get(unit.tenantId);
          if (tenantData) {
            tenant = {
              _id: tenantData._id,
              firstName: tenantData.firstName,
              lastName: tenantData.lastName,
              email: tenantData.email,
              phone: tenantData.phone,
              profileImage: tenantData.profileImage,
            };
          }
        }

        return {
          ...unit,
          tenant,
        };
      })
    );

    allUnits.push(...unitsWithTenants);
  }

  return allUnits;
};
