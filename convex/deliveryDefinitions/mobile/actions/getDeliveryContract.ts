import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';

export const mobileGetDeliveryContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileGetDeliveryContractReturns = v.object({
  success: v.boolean(),
  delivery: v.optional(v.object({
    piiHash: v.string(),
    timeRegistered: v.number(),
    timeArrived: v.number(),
    timeCollected: v.number(),
    failed: v.boolean(),
    returned: v.boolean(),
  })),
  message: v.optional(v.string()),
});

export const mobileGetDeliveryContractHandler = async (
  ctx: ActionCtx,
  args: { piiHash: string }
) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { readContract, deliveryManagementContract } = await import('../../../lib/contracts');
    
    // Convert string to bytes32 format
    const piiHashBytes32 = args.piiHash as `0x${string}`;
    
    // Call smart contract read function
    const result = await readContract({
      address: deliveryManagementContract.address,
      abi: deliveryManagementContract.abi,
      functionName: 'getDelivery',
      args: [piiHashBytes32],
    });
    
    // Parse the result (it's a tuple/struct)
    const delivery = result as any;
    
    return {
      success: true,
      delivery: {
        piiHash: delivery.piiHash,
        timeRegistered: Number(delivery.timeRegistered),
        timeArrived: Number(delivery.timeArrived),
        timeCollected: Number(delivery.timeCollected),
        failed: Boolean(delivery.failed),
        returned: Boolean(delivery.returned),
      },
    };
  } catch (error) {
    console.error('Contract read failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Contract read failed',
    };
  }
};
