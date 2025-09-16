import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getUnitsByPropertyArgs = {
  propertyId: v.id('properties'),
} as const;

export const getUnitsByPropertyReturns = v.array(
  v.object({
    _id: v.id('units'),
    unitNumber: v.string(),
    unitType: v.string(),
    floor: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    rentAmount: v.optional(v.number()),
    tenantId: v.optional(v.id('users')),
    isOccupied: v.boolean(),
    isActive: v.boolean(),
    // Denormalized tenant name
    tenantName: v.optional(v.string()),
  })
);

export const getUnitsByPropertyHandler = async (ctx: QueryCtx, args: { propertyId: Id<'properties'> }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get units for the property
  const units = await ctx.db
    .query('units')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // Get tenant names for occupied units
  const tenantIds = units.filter(u => u.tenantId).map(u => u.tenantId!);

  const tenants = await Promise.all(tenantIds.map(id => ctx.db.get(id)));
  const tenantMap = new Map(tenants.filter(Boolean).map(t => [t!._id, `${t!.firstName} ${t!.lastName}`.trim()]));

  return units.map(unit => ({
    ...unit,
    tenantName: unit.tenantId ? tenantMap.get(unit.tenantId) : undefined,
  }));
};
