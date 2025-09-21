import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const assignTenantToUnitArgs = v.object({
  unitId: v.id('units'),
  tenantId: v.optional(v.id('users')), // Optional - if not provided, assign current user
});

export const assignTenantToUnitHandler = async (ctx: MutationCtx, args: Infer<typeof assignTenantToUnitArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Get the unit
  const unit = await ctx.db.get(args.unitId);
  if (!unit) {
    return { success: false, message: 'Unit not found' };
  }

  // Determine the tenant ID to assign
  const tenantId = args.tenantId || me._id;

  // Get the tenant user
  const tenant = await ctx.db.get(tenantId);
  if (!tenant) {
    return { success: false, message: 'Tenant not found' };
  }

  // Check authorization - user must be manager of the property OR assigning themselves to an available unit
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', unit.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .first();

  const isManager = userProperty?.role === 'manager';
  const isSelfAssignment = tenantId === me._id && !unit.isOccupied;
  const isTenantOfProperty = userProperty?.role === 'tenant';

  if (!isManager && !isSelfAssignment && !(isTenantOfProperty && tenantId === me._id)) {
    return { success: false, message: 'Not authorized to assign tenant to this unit' };
  }

  // Check if tenant is already assigned to another unit in this property
  if (tenantId !== unit.tenantId) {
    const existingUnit = await ctx.db
      .query('units')
      .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
      .filter(q => q.eq(q.field('propertyId'), unit.propertyId))
      .first();

    if (existingUnit && existingUnit._id !== args.unitId) {
      return { success: false, message: 'Tenant is already assigned to another unit in this property' };
    }
  }

  const now = Date.now();

  // Update the unit
  await ctx.db.patch(args.unitId, {
    tenantId: tenantId,
    isOccupied: true,
    updatedAt: now,
  });

  // If this was a self-assignment by a tenant, also ensure they have tenant role for the property
  if (isSelfAssignment && !userProperty) {
    await ctx.db.insert('userProperties', {
      userId: me._id,
      propertyId: unit.propertyId,
      role: 'tenant',
      permissions: ['view_property', 'view_unit', 'create_maintenance'],
      isActive: true,
      assignedAt: now,
      assignedBy: me._id,
    });
  }

  return { success: true, unitId: args.unitId, tenantId };
};
