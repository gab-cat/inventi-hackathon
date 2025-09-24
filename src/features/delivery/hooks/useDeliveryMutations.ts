import { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useProgress } from '@bprogress/next';
import { useToast } from '@/hooks/use-toast';
import { CreateDeliveryForm, AssignDeliveryForm, CollectDeliveryForm, UpdateDeliveryForm } from '../types';

export function useDeliveryMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { start, stop } = useProgress();
  const { toast } = useToast();

  const registerDeliveryMutation = useMutation(api.delivery.webRegisterDelivery);
  const assignDeliveryMutation = useMutation(api.delivery.webAssignDeliveryToRecipient);
  const collectDeliveryMutation = useMutation(api.delivery.webMarkDeliveryAsCollected);
  const updateStatusMutation = useAction(api.delivery.webUpdateDeliveryStatusWithContract);

  const registerDelivery = async (data: CreateDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    start();
    try {
      const result = await registerDeliveryMutation({
        propertyId: data.propertyId as Id<'properties'>,
        unitId: data.unitId as Id<'units'> | undefined,
        deliveryType: data.deliveryType,
        senderName: data.senderName,
        senderCompany: data.senderCompany,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        recipientEmail: data.recipientEmail,
        trackingNumber: data.trackingNumber,
        description: data.description,
        estimatedDelivery: new Date(data.estimatedDelivery).getTime(),
        deliveryLocation: data.deliveryLocation,
        deliveryNotes: data.deliveryNotes,
        photos: data.photos,
      });
      toast({
        title: 'Delivery Created',
        description: 'Delivery has been successfully registered.',
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register delivery';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  const assignDeliveryToRecipient = async (data: AssignDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    start();
    try {
      const result = await assignDeliveryMutation({
        deliveryId: data.deliveryId as Id<'deliveries'>,
        unitId: data.unitId as Id<'units'>,
        notes: data.notes,
      });
      toast({
        title: 'Delivery Assigned',
        description: 'Delivery has been successfully assigned to the recipient.',
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign delivery';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  const markDeliveryAsCollected = async (data: CollectDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    start();
    try {
      const result = await collectDeliveryMutation({
        deliveryId: data.deliveryId as Id<'deliveries'>,
        notes: data.notes,
        photos: data.photos,
      });
      toast({
        title: 'Delivery Collected',
        description: 'Delivery has been successfully marked as collected.',
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark delivery as collected';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  const updateDeliveryStatus = async (deliveryId: Id<'deliveries'>, data: UpdateDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    start();
    try {
      const result = await updateStatusMutation({
        deliveryId,
        status: data.status,
        notes: data.notes,
        actualDelivery: data.actualDelivery ? new Date(data.actualDelivery).getTime() : undefined,
      });
      toast({
        title: 'Status Updated',
        description: `Delivery status has been successfully updated to ${data.status}.`,
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update delivery status';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  return {
    registerDelivery,
    assignDeliveryToRecipient,
    markDeliveryAsCollected,
    updateDeliveryStatus,
    isLoading,
    error,
  };
}
