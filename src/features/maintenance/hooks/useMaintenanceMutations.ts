import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';

export function useMaintenanceMutations() {
  const assignTechnician = useMutation(api.maintenance.webAssignTechnician);
  const updateStatus = useMutation(api.maintenance.webUpdateMaintenanceStatus);
  const updateCost = useMutation(api.maintenance.webUpdateMaintenanceCost);
  const bulkUpdateStatus = useMutation(api.maintenance.webBulkUpdateStatus);

  return {
    assignTechnician: async (requestId: Id<'maintenanceRequests'>, technicianId: Id<'users'>) => {
      await assignTechnician({ requestId, technicianId });
    },
    updateStatus: async (
      requestId: Id<'maintenanceRequests'>,
      status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected',
      note?: string
    ) => {
      await updateStatus({ requestId, status, note });
    },
    updateCost: async (
      requestId: Id<'maintenanceRequests'>,
      estimatedCost?: number,
      actualCost?: number,
      note?: string
    ) => {
      await updateCost({ requestId, estimatedCost, actualCost, note });
    },
    bulkUpdateStatus: async (
      requestIds: Id<'maintenanceRequests'>[],
      status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected',
      note?: string
    ) => {
      await bulkUpdateStatus({ requestIds, status, note });
    },
  };
}
