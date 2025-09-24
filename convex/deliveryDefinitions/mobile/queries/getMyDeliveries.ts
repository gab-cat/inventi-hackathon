import { Id, Doc } from '../../../_generated/dataModel';
import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileGetMyDeliveriesArgs = v.object({
  status: v.optional(
    v.union(
      v.literal('registered'),
      v.literal('arrived'),
      v.literal('collected'),
      v.literal('failed'),
      v.literal('returned')
    )
  ),
  limit: v.optional(v.number()),
  propertyId: v.optional(v.id('properties')),
});

export const mobileGetMyDeliveriesReturns = v.object({
  success: v.boolean(),
  deliveries: v.array(
    v.object({
      _id: v.id('deliveries'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      piiHash: v.optional(v.string()),
      deliveryType: v.string(),
      senderName: v.string(),
      senderCompany: v.optional(v.string()),
      recipientName: v.string(),
      recipientPhone: v.optional(v.string()),
      recipientEmail: v.optional(v.string()),
      trackingNumber: v.optional(v.string()),
      description: v.string(),
      estimatedDelivery: v.number(),
      actualDelivery: v.optional(v.number()),
      status: v.string(),
      deliveryLocation: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Additional property and unit info
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      unit: v.optional(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
        })
      ),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileGetMyDeliveriesHandler = async (ctx: QueryCtx, args: Infer<typeof mobileGetMyDeliveriesArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, deliveries: [], message: 'User not authenticated' };
  }

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) {
    return { success: false, deliveries: [], message: 'User not found' };
  }

  try {
    let deliveries: Doc<'deliveries'>[] = [];

    if (currentUser.role === 'manager') {
      // Managers can see all deliveries for properties they manage
      const managedProperties = await ctx.db
        .query('properties')
        .withIndex('by_manager', q => q.eq('managerId', currentUser._id))
        .collect();

      const propertyIds = managedProperties.map(p => p._id);

      if (propertyIds.length > 0) {
        // Filter by property if specified
        if (args.propertyId) {
          if (propertyIds.includes(args.propertyId)) {
            deliveries = await ctx.db
              .query('deliveries')
              .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
              .collect();
          } else {
            return { success: false, deliveries: [], message: 'Access denied to this property' };
          }
        } else {
          // Get all deliveries for managed properties
          // Use Promise.all with individual queries for better performance
          const deliveryPromises = propertyIds.map(propertyId =>
            ctx.db
              .query('deliveries')
              .withIndex('by_property', q => q.eq('propertyId', propertyId))
              .collect()
          );
          const deliveryArrays = await Promise.all(deliveryPromises);
          deliveries = deliveryArrays.flat();
        }
      }
    } else if (currentUser.role === 'tenant') {
      // Tenants can see deliveries for their units and all deliveries for properties they belong to
      const userUnits = await ctx.db
        .query('units')
        .filter(q => q.eq(q.field('tenantId'), currentUser._id))
        .collect();

      const unitIds = userUnits.map(unit => unit._id);
      const propertyIds = userUnits.map(unit => unit.propertyId);

      if (unitIds.length > 0) {
        // Get deliveries for specific units
        const unitDeliveryPromises = unitIds.map(unitId =>
          ctx.db
            .query('deliveries')
            .withIndex('by_unit', q => q.eq('unitId', unitId))
            .collect()
        );

        // Get ALL deliveries for properties where tenant has units (both unit-specific and general property deliveries)
        const propertyDeliveryPromises = propertyIds.map(propertyId =>
          ctx.db
            .query('deliveries')
            .withIndex('by_property', q => q.eq('propertyId', propertyId))
            .collect()
        );

        const [unitDeliveriesArrays, propertyDeliveriesArrays] = await Promise.all([
          Promise.all(unitDeliveryPromises),
          Promise.all(propertyDeliveryPromises),
        ]);

        // Combine and deduplicate deliveries (some might appear in both unit and property queries)
        const allDeliveries = [...unitDeliveriesArrays.flat(), ...propertyDeliveriesArrays.flat()];
        const deliveryMap = new Map();
        allDeliveries.forEach(delivery => {
          deliveryMap.set(delivery._id, delivery);
        });
        deliveries = Array.from(deliveryMap.values());
      }

      // Filter by property if specified (must be a property the tenant has access to)
      if (args.propertyId) {
        const hasPropertyAccess = propertyIds.includes(args.propertyId);
        if (!hasPropertyAccess) {
          return { success: false, deliveries: [], message: 'Access denied to this property' };
        }
        deliveries = deliveries.filter(d => d.propertyId === args.propertyId);
      }
    } else {
      return { success: false, deliveries: [], message: 'Unauthorized role' };
    }

    // Filter by status if specified
    if (args.status) {
      deliveries = deliveries.filter(d => d.status === args.status);
    }

    // Sort by creation time (newest first)
    deliveries.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if specified
    if (args.limit) {
      deliveries = deliveries.slice(0, args.limit);
    }

    // Enrich with property and unit information
    const enrichedDeliveries = await Promise.all(
      deliveries.map(async delivery => {
        const property = await ctx.db.get(delivery.propertyId);
        let unit: { _id: Id<'units'>; unitNumber: string } | undefined = undefined;

        if (delivery.unitId) {
          const unitData = await ctx.db.get(delivery.unitId);
          if (unitData && unitData.unitNumber) {
            unit = {
              _id: unitData._id,
              unitNumber: unitData.unitNumber,
            };
          }
        }

        // Property must exist for the delivery to be valid
        if (!property) {
          return null;
        }

        return {
          ...delivery,
          property: {
            _id: property._id,
            name: property.name,
            address: property.address,
          },
          unit,
        };
      })
    );

    // Filter out deliveries with missing property data
    const validDeliveries = enrichedDeliveries.filter((d): d is NonNullable<typeof d> => d !== null);

    return {
      success: true,
      deliveries: validDeliveries,
    };
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return {
      success: false,
      deliveries: [],
      message: 'Failed to fetch deliveries',
    };
  }
};
