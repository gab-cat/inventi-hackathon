import { ActionCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';
import { api, internal } from '../../../_generated/api';

export const mobileConfirmDeliveryReceiptArgs = v.object({
  deliveryId: v.id('deliveries'),
  notes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())),
  rating: v.optional(v.number()), // Rating from 1-5
});

export const mobileConfirmDeliveryReceiptReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileConfirmDeliveryReceiptHandler = async (
  ctx: ActionCtx,
  args: Infer<typeof mobileConfirmDeliveryReceiptArgs>
): Promise<Infer<typeof mobileConfirmDeliveryReceiptReturns>> => {
  // Note: Actions don't have auth context, so we'll need to pass userId as a parameter
  // For now, we'll assume the delivery access validation is done on the client side

  // Get the delivery
  const delivery = await ctx.runQuery(api.delivery.getDeliveryStatus, {
    deliveryId: args.deliveryId,
  });

  if (!delivery.success || !delivery.delivery) {
    return { success: false, message: 'Delivery not found' };
  }

  // Note: Access validation should be done on the client side or via a separate authenticated query
  // For this action, we'll assume access has been validated

  const deliveryData = delivery.delivery;

  // Check if delivery can be confirmed as received
  if (!['arrived'].includes(deliveryData.status)) {
    return { success: false, message: 'Only arrived deliveries can be confirmed as received' };
  }

  const now = Date.now();

  try {
    // Use the unified contract action to update status to collected
    const contractResult = await ctx.runAction(api.delivery.updateDeliveryStatusContract, {
      piiHash: deliveryData.piiHash || '',
      newStatus: 'collected',
      notes: args.notes || 'Delivery confirmed as received via mobile app',
    });

    if (!contractResult.success) {
      return {
        success: false,
        message: contractResult.message || 'Failed to update delivery status via blockchain',
      };
    }

    // Update actual delivery time in database (in addition to blockchain update)
    await ctx.runMutation(internal.delivery.updateDeliveryActualTime, {
      deliveryId: args.deliveryId,
      actualDelivery: deliveryData.actualDelivery || now,
      updatedAt: now,
    });

    // TODO: Store rating and photos if provided
    // This could be extended to include delivery feedback/rating system

    // Note: Notification sending should be handled on the client side
    // since actions don't have access to user authentication context

    return {
      success: true,
      transactionHash: contractResult.transactionHash,
      message: 'Delivery receipt confirmed successfully',
    };
  } catch (error) {
    console.error('Error confirming delivery receipt:', error);
    return {
      success: false,
      message: 'Failed to confirm delivery receipt',
    };
  }
};
