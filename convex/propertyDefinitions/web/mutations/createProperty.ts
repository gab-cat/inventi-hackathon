import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const webCreatePropertyArgs = v.object({
  name: v.string(),
  address: v.string(),
  city: v.string(),
  state: v.string(),
  zipCode: v.string(),
  country: v.string(),
  propertyType: v.union(v.literal('apartment'), v.literal('condo'), v.literal('house'), v.literal('commercial')),
  totalUnits: v.number(),
  settings: v.optional(
    v.object({
      visitorLimitPerUnit: v.optional(v.number()),
      deliveryHours: v.optional(
        v.object({
          start: v.string(),
          end: v.string(),
        })
      ),
      maintenanceHours: v.optional(
        v.object({
          start: v.string(),
          end: v.string(),
        })
      ),
    })
  ),
});

export const webCreatePropertyReturns = v.object({
  success: v.boolean(),
  propertyId: v.optional(v.id('properties')),
  message: v.optional(v.string()),
});

export const webCreatePropertyHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof webCreatePropertyArgs>
): Promise<Infer<typeof webCreatePropertyReturns>> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();

  if (!currentUser) {
    return { success: false, message: 'User not found' };
  }

  // Only managers can create properties
  if (currentUser.role !== 'manager') {
    return { success: false, message: 'Only property managers can create properties' };
  }

  // Check if property name already exists for this manager
  const existingProperty = await ctx.db
    .query('properties')
    .withIndex('by_manager', q => q.eq('managerId', currentUser._id))
    .filter(q => q.eq(q.field('name'), args.name))
    .first();

  if (existingProperty) {
    return { success: false, message: 'A property with this name already exists' };
  }

  const now = Date.now();

  try {
    // Create the property
    const propertyId = await ctx.db.insert('properties', {
      name: args.name,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      country: args.country,
      propertyType: args.propertyType,
      totalUnits: args.totalUnits,
      managerId: currentUser._id,
      isActive: true,
      settings: args.settings || {
        visitorLimitPerUnit: 2,
        deliveryHours: {
          start: '08:00',
          end: '20:00',
        },
        maintenanceHours: {
          start: '07:00',
          end: '19:00',
        },
      },
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, propertyId };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, message: 'Failed to create property' };
  }
};
