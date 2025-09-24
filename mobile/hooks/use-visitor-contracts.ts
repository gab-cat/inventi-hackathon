import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { VISITOR_MANAGEMENT_CONTRACT_ADDRESS, VISITOR_MANAGEMENT_CONTRACT_ABI } from '@/lib/contracts';

export function useVisitorContract() {
  // Write operations hook
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Account hook for address-specific operations
  const { address } = useAccount();

  // Transaction confirmation hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract data - address-specific reads
  const {
    data: myVisitors,
    refetch: refetchMyVisitors,
    isLoading: isMyVisitorsLoading,
  } = useReadContract({
    address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
    abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
    functionName: 'getMyVisitors',
    args: address ? [BigInt(0), BigInt(50)] : undefined, // Default pagination
    query: { enabled: Boolean(address) },
  });

  // Read contract data - visitor log (disabled by default)
  const {
    data: visitorLog,
    refetch: refetchVisitorLog,
    isLoading: isVisitorLogLoading,
  } = useReadContract({
    address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
    abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
    functionName: 'getVisitorLog',
    args: ['0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`], // Placeholder, will be set when called
    query: { enabled: false }, // Only fetch when explicitly requested
  });

  // Data normalization for visitor log
  const normalizedVisitorLog = visitorLog
    ? {
        visitor: {
          piiHash: visitorLog[0].piiHash,
          unitOwner: visitorLog[0].unitOwner,
          unitId: visitorLog[0].unitId,
          visitStart: Number(visitorLog[0].visitStart),
          visitEnd: Number(visitorLog[0].visitEnd),
          createdAt: Number(visitorLog[0].createdAt),
          status: visitorLog[0].status, // enum value
          checkInAt: Number(visitorLog[0].checkInAt),
          checkOutAt: Number(visitorLog[0].checkOutAt),
        },
        documents: visitorLog[1],
      }
    : null;

  // Write contract functions
  const checkInVisitor = (piiHash: `0x${string}`) => {
    writeContract({
      address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
      abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
      functionName: 'checkInVisitor',
      args: [piiHash],
    });
  };

  const checkOutVisitor = (piiHash: `0x${string}`) => {
    writeContract({
      address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
      abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
      functionName: 'checkOutVisitor',
      args: [piiHash],
    });
  };

  const createVisitorEntry = (
    unitOwner: `0x${string}`,
    unitId: string,
    visitStart: number,
    visitEnd: number,
    piiHash: `0x${string}`
  ) => {
    writeContract({
      address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
      abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
      functionName: 'createVisitorEntry',
      args: [unitOwner, unitId, BigInt(visitStart), BigInt(visitEnd), piiHash],
    });
  };

  // Note: For parameterized reads like getActiveVisitors, getVisitorLog, and searchVisitorHistory,
  // create separate useReadContract calls in components or separate hooks

  // Utility functions
  const refetchAll = () => {
    refetchMyVisitors();
    refetchVisitorLog();
  };

  return {
    // Contract constants and computed values
    visitorContractAddress: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,

    // Raw contract state
    myVisitors: myVisitors as `0x${string}`[],
    visitorLog: normalizedVisitorLog,

    // Loading states
    isMyVisitorsLoading,
    isVisitorLogLoading,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Contract functions
    checkInVisitor,
    checkOutVisitor,
    createVisitorEntry,

    // Utility functions
    refetchAll,
  };
}
