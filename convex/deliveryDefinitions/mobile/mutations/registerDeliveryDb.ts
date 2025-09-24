import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const mobileRegisterDeliveryDbArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')), // Optional for common area deliveries
  piiHash: v.string(),
  deliveryType: v.union(
    v.literal('package'),
    v.literal('food'),
    v.literal('grocery'),
    v.literal('mail'),
    v.literal('other')
  ),
  senderName: v.string(),
  senderCompany: v.optional(v.string()),
  recipientName: v.string(),
  recipientPhone: v.optional(v.string()),
  recipientEmail: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
  description: v.string(),
  estimatedDelivery: v.number(), // Timestamp
  deliveryLocation: v.optional(v.string()), // "unit", "lobby", "mailroom", "storage"
  deliveryNotes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())), // Photo URLs
});

export const mobileRegisterDeliveryDbReturns = v.object({
  success: v.boolean(),
  deliveryId: v.optional(v.id('deliveries')),
  message: v.optional(v.string()),
});

type Args = {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  piiHash: string;
  deliveryType: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  senderName: string;
  senderCompany?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  trackingNumber?: string;
  description: string;
  estimatedDelivery: number;
  deliveryLocation?: string;
  deliveryNotes?: string;
  photos?: string[];
};

export const mobileRegisterDeliveryDbHandler = async (
  ctx: MutationCtx,
  args: Args
): Promise<{
  success: boolean;
  deliveryId?: Id<'deliveries'>;
  message?: string;
}> => {
  try {
    // Verify property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      return {
        success: false,
        message: 'Property not found',
      };
    }

    // Verify unit exists and belongs to the property (if specified)
    if (args.unitId) {
      const unit = await ctx.db.get(args.unitId);
      if (!unit) {
        return {
          success: false,
          message: 'Unit not found',
        };
      }
      if (unit.propertyId !== args.propertyId) {
        return {
          success: false,
          message: 'Unit does not belong to the specified property',
        };
      }
    }

    // Validate estimated delivery time
    const now = Date.now();
    if (args.estimatedDelivery <= now) {
      return {
        success: false,
        message: 'Estimated delivery time must be in the future',
      };
    }

    // Create the delivery in database
    const deliveryId = await ctx.db.insert('deliveries', {
      propertyId: args.propertyId,
      unitId: args.unitId,
      piiHash: args.piiHash, // Store the hash for blockchain operations
      deliveryType: args.deliveryType,
      senderName: args.senderName,
      senderCompany: args.senderCompany,
      recipientName: args.recipientName,
      recipientPhone: args.recipientPhone,
      recipientEmail: args.recipientEmail,
      trackingNumber: args.trackingNumber,
      description: args.description,
      estimatedDelivery: args.estimatedDelivery,
      status: 'registered',
      deliveryLocation: args.deliveryLocation,
      deliveryNotes: args.deliveryNotes,
      photos: args.photos,
      createdAt: now,
      updatedAt: now,
    });

    // Create delivery log entry
    await ctx.db.insert('deliveryLogs', {
      deliveryId,
      propertyId: args.propertyId,
      action: 'registered',
      timestamp: now,
      performedBy: undefined, // Mobile delivery personnel - no user ID
      notes: `Delivery registered via mobile app`,
      createdAt: now,
    });

    return {
      success: true,
      deliveryId,
    };
  } catch (error) {
    console.error('Delivery database registration failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to register delivery in database',
    };
  }
};
