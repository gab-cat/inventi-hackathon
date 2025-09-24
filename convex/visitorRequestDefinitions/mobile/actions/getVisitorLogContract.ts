import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';

export const mobileGetVisitorLogContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileGetVisitorLogContractReturns = v.object({
  success: v.boolean(),
  visitorLog: v.optional(v.object({
    visitor: v.object({
      piiHash: v.string(),
      unitOwner: v.string(),
      unitId: v.string(),
      visitStart: v.number(),
      visitEnd: v.number(),
      createdAt: v.number(),
      status: v.number(), // enum value
      checkInAt: v.number(),
      checkOutAt: v.number(),
    }),
    documents: v.array(v.string()),
  })),
  message: v.optional(v.string()),
});

export const mobileGetVisitorLogContractHandler = async (
  ctx: ActionCtx,
  args: { piiHash: string }
) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { readContract, visitorManagementContract } = await import('../../../lib/contracts');
    
    // Convert string to bytes32 format
    const piiHashBytes32 = args.piiHash as `0x${string}`;
    
    // Call smart contract read function
    const result = await readContract({
      address: visitorManagementContract.address,
      abi: visitorManagementContract.abi,
      functionName: 'getVisitorLog',
      args: [piiHashBytes32],
    });
    
    // Parse the result (it's a tuple containing visitor struct and documents array)
    const [visitor, documents] = result as any;
    
    return {
      success: true,
      visitorLog: {
        visitor: {
          piiHash: visitor.piiHash,
          unitOwner: visitor.unitOwner,
          unitId: visitor.unitId,
          visitStart: Number(visitor.visitStart),
          visitEnd: Number(visitor.visitEnd),
          createdAt: Number(visitor.createdAt),
          status: Number(visitor.status),
          checkInAt: Number(visitor.checkInAt),
          checkOutAt: Number(visitor.checkOutAt),
        },
        documents: documents.map((doc: any) => doc.toString()),
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
