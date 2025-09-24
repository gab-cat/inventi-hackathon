import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { PROPERTY_CONTRACT_ADDRESS, PROPERTY_CONTRACT_ABI } from '@/lib/contracts';

export function usePropertyContract() {
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
    data: isAuthorized,
    refetch: refetchIsAuthorized,
    isLoading: isAuthorizedLoading,
  } = useReadContract({
    address: PROPERTY_CONTRACT_ADDRESS,
    abi: PROPERTY_CONTRACT_ABI,
    functionName: 'isAuthorized',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const {
    data: unitCount,
    refetch: refetchUnitCount,
    isLoading: isUnitCountLoading,
  } = useReadContract({
    address: PROPERTY_CONTRACT_ADDRESS,
    abi: PROPERTY_CONTRACT_ABI,
    functionName: 'getUnitCount',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const {
    data: unitIds,
    refetch: refetchUnitIds,
    isLoading: isUnitIdsLoading,
  } = useReadContract({
    address: PROPERTY_CONTRACT_ADDRESS,
    abi: PROPERTY_CONTRACT_ABI,
    functionName: 'getUnitIds',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  // Read contract data - non-address-specific reads
  const {
    data: deliveryManagementAddress,
    refetch: refetchDeliveryManagement,
    isLoading: isDeliveryManagementLoading,
  } = useReadContract({
    address: PROPERTY_CONTRACT_ADDRESS,
    abi: PROPERTY_CONTRACT_ABI,
    functionName: 'getDeliveryManagement',
  });

  const {
    data: visitorManagementAddress,
    refetch: refetchVisitorManagement,
    isLoading: isVisitorManagementLoading,
  } = useReadContract({
    address: PROPERTY_CONTRACT_ADDRESS,
    abi: PROPERTY_CONTRACT_ABI,
    functionName: 'getVisitorManagementRegistry',
  });

  // Data normalization
  const normalizedIsAuthorized = Boolean(isAuthorized);
  const normalizedUnitCount = unitCount ? Number(unitCount) : 0;

  // Write contract functions
  const authorizeWallet = (wallet: `0x${string}`) => {
    writeContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_CONTRACT_ABI,
      functionName: 'authorizeWallet',
      args: [wallet],
    });
  };

  const registerUnit = (unitOwner: `0x${string}`, unitId: string, maxVisitors: number) => {
    writeContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_CONTRACT_ABI,
      functionName: 'registerUnit',
      args: [unitOwner, unitId, BigInt(maxVisitors)],
    });
  };

  const revokeWallet = (wallet: `0x${string}`) => {
    writeContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_CONTRACT_ABI,
      functionName: 'revokeWallet',
      args: [wallet],
    });
  };

  const setUnitOwner = (unitId: string, newOwner: `0x${string}`) => {
    writeContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_CONTRACT_ABI,
      functionName: 'setUnitOwner',
      args: [unitId, newOwner],
    });
  };

  const updateUnitCapacity = (unitId: string, newMaxVisitors: number) => {
    writeContract({
      address: PROPERTY_CONTRACT_ADDRESS,
      abi: PROPERTY_CONTRACT_ABI,
      functionName: 'updateUnitCapacity',
      args: [unitId, BigInt(newMaxVisitors)],
    });
  };

  // Note: For parameterized reads like getMaxVisitors and getUnitOwner,
  // create separate hooks or use them directly in components with specific unitId parameters

  // Utility functions
  const refetchAll = () => {
    refetchIsAuthorized();
    refetchUnitCount();
    refetchUnitIds();
    refetchDeliveryManagement();
    refetchVisitorManagement();
  };

  return {
    // Contract constants and computed values
    propertyContractAddress: PROPERTY_CONTRACT_ADDRESS,

    // Raw contract state
    isAuthorized: normalizedIsAuthorized,
    unitCount: normalizedUnitCount,
    unitIds,
    deliveryManagementAddress: deliveryManagementAddress as `0x${string}`,
    visitorManagementAddress: visitorManagementAddress as `0x${string}`,

    // Loading states
    isAuthorizedLoading,
    isUnitCountLoading,
    isUnitIdsLoading,
    isDeliveryManagementLoading,
    isVisitorManagementLoading,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Contract functions
    authorizeWallet,
    registerUnit,
    revokeWallet,
    setUnitOwner,
    updateUnitCapacity,

    // Utility functions
    refetchAll,
  };
}
