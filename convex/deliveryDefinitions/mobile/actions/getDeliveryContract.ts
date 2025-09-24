import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';

export const mobileGetDeliveryContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileGetDeliveryContractReturns = v.object({
  success: v.boolean(),
  delivery: v.optional(
    v.object({
      piiHash: v.string(),
      timeRegistered: v.number(),
      timeArrived: v.number(),
      timeCollected: v.number(),
      failed: v.boolean(),
      returned: v.boolean(),
    })
  ),
  message: v.optional(v.string()),
});

export const mobileGetDeliveryContractHandler = async (ctx: ActionCtx, args: { piiHash: string }) => {
  try {
    console.log('Starting getDeliveryContract with piiHash:', args.piiHash);

    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { readContract, deliveryManagementContract } = await import('../../../lib/contracts');

    console.log('Contract address:', deliveryManagementContract.address);
    console.log('Using chain: Polygon Amoy testnet');

    // Validate and convert string to bytes32 format
    if (!args.piiHash || typeof args.piiHash !== 'string') {
      throw new Error('Invalid piiHash: must be a non-empty string');
    }

    // Ensure the hash has the correct format
    let piiHashBytes32: `0x${string}`;
    if (args.piiHash.startsWith('0x')) {
      if (args.piiHash.length !== 66) {
        throw new Error(`Invalid piiHash length: expected 66 characters (including 0x), got ${args.piiHash.length}`);
      }
      piiHashBytes32 = args.piiHash as `0x${string}`;
    } else {
      if (args.piiHash.length !== 64) {
        throw new Error(`Invalid piiHash length: expected 64 characters (without 0x), got ${args.piiHash.length}`);
      }
      piiHashBytes32 = `0x${args.piiHash}` as `0x${string}`;
    }

    console.log('Formatted piiHash:', piiHashBytes32);

    // Call smart contract read function
    console.log('Calling contract function getDelivery...');
    const result = await readContract({
      address: deliveryManagementContract.address,
      abi: deliveryManagementContract.abi,
      functionName: 'getDelivery',
      args: [piiHashBytes32],
    });

    console.log('Raw contract result:', result);

    // Parse the result (it's a tuple/struct)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delivery = result as any;

    if (!delivery) {
      throw new Error('No delivery data returned from contract');
    }

    const parsedDelivery = {
      piiHash: delivery.piiHash || delivery[0],
      timeRegistered: Number(delivery.timeRegistered || delivery[1] || 0),
      timeArrived: Number(delivery.timeArrived || delivery[2] || 0),
      timeCollected: Number(delivery.timeCollected || delivery[3] || 0),
      failed: Boolean(delivery.failed || delivery[4]),
      returned: Boolean(delivery.returned || delivery[5]),
    };

    console.log('Parsed delivery data:', parsedDelivery);

    return {
      success: true,
      delivery: parsedDelivery,
    };
  } catch (error) {
    console.error('Contract read failed:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Contract read failed',
    };
  }
};
