import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useProgress } from '@bprogress/next';
import { toast } from 'sonner';

export function useAssetMaintenanceMutations() {
  const assignAssetMaintenance = useMutation(api.assets.webAssignAssetMaintenance);
  const { start, stop } = useProgress();

  const assignMaintenance = async (
    assetId: Id<'assets'>,
    technicianId: Id<'users'>,
    scheduledDate?: number,
    notes?: string
  ) => {
    try {
      start();
      const maintenanceRequestId = await assignAssetMaintenance({
        assetId,
        technicianId,
        scheduledDate,
        notes,
      });

      toast.success('Maintenance assigned successfully');
      return maintenanceRequestId;
    } catch (error) {
      console.error('Failed to assign maintenance:', error);
      toast.error('Failed to assign maintenance. Please try again.');
      throw error;
    } finally {
      stop();
    }
  };

  return {
    assignMaintenance,
  };
}
