'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useMaintenanceMutations } from '../hooks/useMaintenanceMutations';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useQuery } from 'convex/react';

interface AssignmentDialogProps {
  requestId: Id<'maintenanceRequests'>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignmentDialog({ requestId, isOpen, onClose, onSuccess }: AssignmentDialogProps) {
  const [selectedTechnician, setSelectedTechnician] = useState<Id<'users'> | null>(null);
  const technicians = useQuery(api.maintenance.webGetTechnicians, {});
  const { assignTechnician } = useMaintenanceMutations();

  const handleAssign = async () => {
    if (!selectedTechnician) return;

    try {
      await assignTechnician(requestId, selectedTechnician);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to assign technician:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogDescription>Select a technician to assign to this maintenance request.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='technician'>Select Technician</Label>
            <select
              id='technician'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              value={selectedTechnician || ''}
              onChange={e => setSelectedTechnician((e.target.value as Id<'users'>) || null)}
            >
              <option value=''>Select a technician...</option>
              {technicians?.map(tech => (
                <option key={tech._id} value={tech._id}>
                  {tech.firstName} {tech.lastName} ({tech.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedTechnician}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
