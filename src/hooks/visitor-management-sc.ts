'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { VISITOR_MANAGEMENT_REGISTRY_ADDRESS, VISITOR_MANAGEMENT_REGISTRY_ABI } from '@/lib/contract';

export function useVisitorManagement(
  unitId?: string,
  offset?: number,
  limit?: number,
  piiHash?: string,
  fromTs?: number,
  toTs?: number
) {
  const { writeContract } = useWriteContract();

  // Read functions

  const { data: getActiveVisitors } = useReadContract({
    address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
    abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
    functionName: 'getActiveVisitors',
    args: unitId ? [unitId] : undefined,
  });

  const { data: getMyVisitors } = useReadContract({
    address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
    abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
    functionName: 'getMyVisitors',
    args: offset !== undefined && limit !== undefined ? [BigInt(offset), BigInt(limit)] : undefined,
  });

  const { data: getVisitorLog } = useReadContract({
    address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
    abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
    functionName: 'getVisitorLog',
    args: piiHash ? [piiHash as `0x${string}`] : undefined,
  });

  const { data: searchVisitorHistory } = useReadContract({
    address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
    abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
    functionName: 'searchVisitorHistory',
    args:
      unitId !== undefined && fromTs !== undefined && toTs !== undefined && offset !== undefined && limit !== undefined
        ? [unitId, BigInt(fromTs), BigInt(toTs), BigInt(offset), BigInt(limit)]
        : undefined,
  });

  // Write functions
  const checkInVisitor = (piiHash: string) => {
    return writeContract({
      address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
      abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
      functionName: 'checkInVisitor',
      args: [piiHash as `0x${string}`],
    });
  };

  const checkOutVisitor = (piiHash: string) => {
    return writeContract({
      address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
      abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
      functionName: 'checkOutVisitor',
      args: [piiHash as `0x${string}`],
    });
  };

  const createVisitorEntry = (unitOwner: string, unitId: string, fromTs: number, toTs: number, piiHash: string) => {
    return writeContract({
      address: VISITOR_MANAGEMENT_REGISTRY_ADDRESS,
      abi: VISITOR_MANAGEMENT_REGISTRY_ABI,
      functionName: 'createVisitorEntry',
      args: [
        unitOwner as `0x${string}`,
        unitId as `0x${string}`,
        BigInt(fromTs),
        BigInt(toTs),
        piiHash as `0x${string}`,
      ],
    });
  };

  return {
    getActiveVisitors,
    getMyVisitors,
    getVisitorLog,
    searchVisitorHistory,
    checkInVisitor,
    checkOutVisitor,
    createVisitorEntry,
  };
}
