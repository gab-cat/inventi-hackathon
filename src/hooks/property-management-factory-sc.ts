'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PROPERTY_MANAGEMENT_FACTORY_ABI, PROPERTY_MANAGEMENT_FACTORY_ADDRESS } from '@/lib/contract';

export const usePropertyManagementFactory = (unitId?: string) => {
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  // Read functions

  const { data: getMaxVisitors } = useReadContract({
    address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
    abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
    functionName: 'getMaxVisitors',
    args: unitId ? [unitId] : undefined,
  });

  const { data: getUnitCount } = useReadContract({
    address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
    abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
    functionName: 'getUnitCount',
    args: address ? [address] : undefined,
  });

  const { data: getUnitIds } = useReadContract({
    address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
    abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
    functionName: 'getUnitIds',
    args: address ? [address] : undefined,
  });

  const { data: getUnitOwner } = useReadContract({
    address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
    abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
    functionName: 'getUnitOwner',
    args: unitId ? [unitId] : undefined,
  });

  const { data: isAuthorized } = useReadContract({
    address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
    abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
    functionName: 'isAuthorized',
    args: address ? [address] : undefined,
  });

  // Write Functions
  const authorizeWallet = (walletAddress: string) => {
    return writeContract({
      address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
      abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
      functionName: 'authorizeWallet',
      args: [walletAddress as `0x${string}`],
    });
  };

  const registerUnit = (unitId: string, maxVisitors: bigint) => {
    return writeContract({
      address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
      abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
      functionName: 'registerUnit',
      args: [address as `0x${string}`, unitId, maxVisitors],
    });
  };

  const revokeWallet = (walletAddress: string) => {
    return writeContract({
      address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
      abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
      functionName: 'revokeWallet',
      args: [walletAddress as `0x${string}`],
    });
  };

  const setUnitOwner = (unitId: string, newOwner: string) => {
    return writeContract({
      address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
      abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
      functionName: 'setUnitOwner',
      args: [unitId, newOwner as `0x${string}`],
    });
  };

  const updateUnitCapacity = (unitId: string, newMaxVisitors: bigint) => {
    return writeContract({
      address: PROPERTY_MANAGEMENT_FACTORY_ADDRESS,
      abi: PROPERTY_MANAGEMENT_FACTORY_ABI,
      functionName: 'updateUnitCapacity',
      args: [unitId, newMaxVisitors],
    });
  };

  return {
    address,
    getMaxVisitors,
    getUnitCount,
    getUnitIds,
    getUnitOwner,
    isAuthorized,
    authorizeWallet,
    registerUnit,
    revokeWallet,
    setUnitOwner,
    updateUnitCapacity,
  };
};
