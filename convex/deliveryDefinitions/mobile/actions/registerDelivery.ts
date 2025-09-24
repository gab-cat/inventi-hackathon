import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { internal, api } from '../../../_generated/api';

export const mobileRegisterDeliveryArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')), // Optional for common area deliveries
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

export const mobileRegisterDeliveryReturns = v.object({
  success: v.boolean(),
  deliveryId: v.optional(v.id('deliveries')),
  message: v.optional(v.string()),
});

type Args = {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
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

export const mobileRegisterDeliveryHandler = async (
  ctx: ActionCtx,
  args: Args
): Promise<{
  success: boolean;
  deliveryId?: Id<'deliveries'>;
  message?: string;
}> => {
  try {
    // Generate PII hash using the hash action
    const hashResult = await ctx.runAction(api.hash.hashPii, {
      recipientName: args.recipientName,
      recipientPhone: args.recipientPhone,
      recipientEmail: args.recipientEmail,
    });

    if (!hashResult.success || !hashResult.piiHash) {
      return {
        success: false,
        message: hashResult.message || 'Failed to generate PII hash',
      };
    }

    // Register delivery in database using the hash
    const dbResult = await ctx.runMutation(internal.delivery.registerDeliveryDb, {
      ...args,
      piiHash: hashResult.piiHash,
    });

    return dbResult;
  } catch (error) {
    console.error('Delivery registration failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to register delivery',
    };
  }
};
