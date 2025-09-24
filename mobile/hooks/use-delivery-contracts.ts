import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DELIVERY_MANAGEMENT_CONTRACT_ADDRESS, DELIVERY_MANAGEMENT_CONTRACT_ABI } from '@/lib/contracts';

// Import the new Convex-based hook
import { useDeliveryContractConvex } from './use-delivery-contracts-convex';

export function useDeliveryContract() {
  // Get the Convex-based contract functions
  const convexContract = useDeliveryContractConvex();

  // Write operations hook (kept for backward compatibility)
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Transaction confirmation hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract data
  const {
    data: delivery,
    refetch: refetchDelivery,
    isLoading: isDeliveryLoading,
  } = useReadContract({
    address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
    abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
    functionName: 'getDelivery',
    args: ['0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`], // Placeholder, will be set when called
    query: { enabled: false }, // Only fetch when explicitly requested
  });

  // Data normalization for delivery struct
  const normalizedDelivery = delivery
    ? {
        piiHash: delivery.piiHash,
        timeRegistered: Number(delivery.timeRegistered),
        timeArrived: Number(delivery.timeArrived),
        timeCollected: Number(delivery.timeCollected),
        failed: Boolean(delivery.failed),
        returned: Boolean(delivery.returned),
      }
    : null;

  // Write contract functions
  const registerDelivery = (piiHash: `0x${string}`) => {
    writeContract({
      address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
      abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
      functionName: 'registerDelivery',
      args: [piiHash],
    });
  };

  const markArrived = (piiHash: `0x${string}`) => {
    writeContract({
      address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
      abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
      functionName: 'markArrived',
      args: [piiHash],
    });
  };

  const markCollected = (piiHash: `0x${string}`) => {
    writeContract({
      address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
      abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
      functionName: 'markCollected',
      args: [piiHash],
    });
  };

  const markFailed = (piiHash: `0x${string}`) => {
    writeContract({
      address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
      abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
      functionName: 'markFailed',
      args: [piiHash],
    });
  };

  const markReturned = (piiHash: `0x${string}`) => {
    writeContract({
      address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
      abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
      functionName: 'markReturned',
      args: [piiHash],
    });
  };

  // Note: For parameterized reads like getDelivery with piiHash,
  // create separate useReadContract calls in components or separate hooks

  // Utility functions
  const refetchAll = () => {
    refetchDelivery();
  };

  return {
    // Contract constants and computed values
    deliveryContractAddress: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,

    // Raw contract state
    delivery: normalizedDelivery,
    isDeliveryLoading,

    // Transaction state (direct wagmi)
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Direct contract functions (wagmi - deprecated, use Convex versions instead)
    registerDelivery: registerDelivery,
    markArrived: markArrived,
    markCollected: markCollected,
    markFailed: markFailed,
    markReturned: markReturned,

    // Convex-based contract functions (recommended)
    convexContract: {
      registerDelivery: convexContract.registerDelivery,
      markArrived: convexContract.markArrived,
      markCollected: convexContract.markCollected,
      markFailed: convexContract.markFailed,
      markReturned: convexContract.markReturned,
      getDelivery: convexContract.getDelivery,
      isLoading: convexContract.isLoading,
      error: convexContract.error,
      lastTransactionHash: convexContract.lastTransactionHash,
      clearError: convexContract.clearError,
    },

    // Utility functions
    refetchAll,
  };
}
