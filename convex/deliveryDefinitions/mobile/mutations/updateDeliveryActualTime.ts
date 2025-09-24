import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileUpdateDeliveryActualTimeArgs = v.object({
  deliveryId: v.id('deliveries'),
  actualDelivery: v.number(),
  updatedAt: v.number(),
});

export const mobileUpdateDeliveryActualTimeReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const mobileUpdateDeliveryActualTimeHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileUpdateDeliveryActualTimeArgs>
): Promise<Infer<typeof mobileUpdateDeliveryActualTimeReturns>> => {
  try {
    await ctx.db.patch(args.deliveryId, {
      actualDelivery: args.actualDelivery,
      updatedAt: args.updatedAt,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating delivery actual time:', error);
    return {
      success: false,
      message: 'Failed to update delivery actual time',
    };
  }
};
