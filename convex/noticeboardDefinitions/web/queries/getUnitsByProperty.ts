import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetUnitsByPropertyArgs = {
  propertyId: v.id('properties'),
} as const;

export const webGetUnitsByPropertyReturns = v.array(
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

type Args = {
  propertyId: Id<'properties'>;
};

export const webGetUnitsByPropertyHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify property exists and user has access to it
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Get units for the property
  const units = await ctx.db
    .query('units')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
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

  return unitsWithTenants;
};
