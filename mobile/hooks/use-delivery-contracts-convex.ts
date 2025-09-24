import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

export function useDeliveryContractConvex() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);

  // Contract action hooks
  const registerDeliveryAction = useAction(api.delivery.registerDeliveryContract);
  const updateDeliveryStatusAction = useAction(api.delivery.updateDeliveryStatusContract);
  const getDeliveryAction = useAction(api.delivery.getDeliveryContract);

  // Helper function to handle contract calls
  const handleContractCall = async <T>(actionFn: () => Promise<T>, actionName: string): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await actionFn();

      // Extract transaction hash if available
      if (result && typeof result === 'object' && 'transactionHash' in result) {
        setLastTransactionHash((result as any).transactionHash);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${actionName} failed`;
      setError(errorMessage);
      console.error(`${actionName} error:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract functions
  const registerDelivery = async (piiHash: string) => {
    return handleContractCall(() => registerDeliveryAction({ piiHash }), 'Register Delivery');
  };

  const markArrived = async (piiHash: string, notes?: string) => {
    return handleContractCall(
      () => updateDeliveryStatusAction({ piiHash, newStatus: 'arrived', notes }),
      'Mark Arrived'
    );
  };

  const markCollected = async (piiHash: string, notes?: string) => {
    return handleContractCall(
      () => updateDeliveryStatusAction({ piiHash, newStatus: 'collected', notes }),
      'Mark Collected'
    );
  };

  const markFailed = async (piiHash: string, notes?: string) => {
    return handleContractCall(() => updateDeliveryStatusAction({ piiHash, newStatus: 'failed', notes }), 'Mark Failed');
  };

  const markReturned = async (piiHash: string, notes?: string) => {
    return handleContractCall(
      () => updateDeliveryStatusAction({ piiHash, newStatus: 'returned', notes }),
      'Mark Returned'
    );
  };

  const getDelivery = async (piiHash: string) => {
    return handleContractCall(() => getDeliveryAction({ piiHash }), 'Get Delivery');
  };

  // Clear error function
  const clearError = () => setError(null);

  return {
    // Contract functions
    registerDelivery,
    markArrived,
    markCollected,
    markFailed,
    markReturned,
    getDelivery,

    // State
    isLoading,
    error,
    lastTransactionHash,

    // Utility functions
    clearError,
  };
}
