import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { CreateDeliveryForm, AssignDeliveryForm, CollectDeliveryForm, UpdateDeliveryForm } from '../types';

export function useDeliveryMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerDeliveryMutation = useMutation(api.delivery.webRegisterDelivery);
  const assignDeliveryMutation = useMutation(api.delivery.webAssignDeliveryToRecipient);
  const collectDeliveryMutation = useMutation(api.delivery.webMarkDeliveryAsCollected);
  const updateStatusMutation = useMutation(api.delivery.webUpdateDeliveryStatus);

  const registerDelivery = async (data: CreateDeliveryForm) => {
    setIsLoading(true);
    setError(null);
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
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register delivery';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const assignDeliveryToRecipient = async (data: AssignDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await assignDeliveryMutation({
        deliveryId: data.deliveryId as Id<'deliveries'>,
        unitId: data.unitId as Id<'units'>,
        notes: data.notes,
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign delivery';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markDeliveryAsCollected = async (data: CollectDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await collectDeliveryMutation({
        deliveryId: data.deliveryId as Id<'deliveries'>,
        notes: data.notes,
        photos: data.photos,
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark delivery as collected';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: Id<'deliveries'>, data: UpdateDeliveryForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateStatusMutation({
        deliveryId,
        status: data.status,
        notes: data.notes,
        actualDelivery: data.actualDelivery ? new Date(data.actualDelivery).getTime() : undefined,
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update delivery status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
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
