'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, MapPin, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Asset } from '../types';
import { Id } from '@convex/_generated/dataModel';

interface MaintenanceDueListProps {
  assets: Asset[];
  isLoading: boolean;
  propertyId: Id<'properties'>;
  onAssignMaintenance: (
    assetId: Id<'assets'>,
    technicianId: Id<'users'>,
    scheduledDate?: number,
    notes?: string
  ) => Promise<void>;
}

interface AssignmentDialogState {
  isOpen: boolean;
  asset: Asset | null;
  selectedTechnician: Id<'users'> | null;
  scheduledDate: Date | undefined;
  notes: string;
}

export function MaintenanceDueList({ assets, isLoading, propertyId, onAssignMaintenance }: MaintenanceDueListProps) {
  // Get technicians for assignment
  const technicians = useAuthenticatedQuery(api.assets.webGetTechnicians, {
    propertyId,
  });
  const [assignmentDialog, setAssignmentDialog] = useState<AssignmentDialogState>({
    isOpen: false,
    asset: null,
    selectedTechnician: null,
    scheduledDate: undefined,
    notes: '',
  });

  const handleAssignClick = (asset: Asset) => {
    setAssignmentDialog({
      isOpen: true,
      asset,
      selectedTechnician: null,
      scheduledDate: asset.maintenanceSchedule?.nextMaintenance
        ? new Date(asset.maintenanceSchedule.nextMaintenance)
        : undefined,
      notes: '',
    });
  };

  const handleAssignSubmit = async () => {
    if (!assignmentDialog.asset || !assignmentDialog.selectedTechnician) return;

    try {
      await onAssignMaintenance(
        assignmentDialog.asset._id,
        assignmentDialog.selectedTechnician,
        assignmentDialog.scheduledDate?.getTime(),
        assignmentDialog.notes
      );
      setAssignmentDialog({
        isOpen: false,
        asset: null,
        selectedTechnician: null,
        scheduledDate: undefined,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to assign maintenance:', error);
    }
  };

  const getUrgencyColor = (daysUntil: number | undefined) => {
    if (!daysUntil) return 'bg-gray-100 text-gray-800';
    if (daysUntil <= 0) return 'bg-red-100 text-red-800';
    if (daysUntil <= 2) return 'bg-orange-100 text-orange-800';
    if (daysUntil <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getUrgencyLabel = (daysUntil: number | undefined) => {
    if (!daysUntil) return 'Unknown';
    if (daysUntil <= 0) return 'Overdue';
    if (daysUntil <= 2) return 'Urgent';
    if (daysUntil <= 5) return 'Soon';
    return 'Scheduled';
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card>
              <CardContent className='p-6'>
                <div className='animate-pulse space-y-3'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='text-center py-12'
      >
        <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4'>
          <CheckCircle className='w-8 h-8 text-green-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>All Assets Up to Date</h3>
        <p className='text-gray-500'>No assets require maintenance in the next 7 days.</p>
      </motion.div>
    );
  }

  return (
    <div className='space-y-4'>
      <AnimatePresence>
        {assets.map((asset, index) => (
          <motion.div
            key={asset._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className='cursor-pointer'
          >
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <Wrench className='w-5 h-5 text-blue-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg'>{asset.name}</h3>
                        <p className='text-sm text-gray-500'>Tag: {asset.assetTag}</p>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                      <div className='flex items-center gap-2'>
                        <MapPin className='w-4 h-4 text-gray-400' />
                        <span>{asset.location}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Clock className='w-4 h-4 text-gray-400' />
                        <span>
                          {asset.daysUntilNextMaintenance !== undefined
                            ? `${asset.daysUntilNextMaintenance} days`
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 text-gray-400' />
                        <span>
                          {asset.assignedUser
                            ? `${asset.assignedUser.firstName} ${asset.assignedUser.lastName}`
                            : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {asset.category}
                      </Badge>
                      <Badge variant='outline' className='text-xs'>
                        {asset.condition}
                      </Badge>
                      <Badge className={cn('text-xs', getUrgencyColor(asset.daysUntilNextMaintenance))}>
                        {getUrgencyLabel(asset.daysUntilNextMaintenance)}
                      </Badge>
                    </div>
                  </div>

                  <div className='flex flex-col gap-2 ml-4'>
                    <Button
                      onClick={() => handleAssignClick(asset)}
                      size='sm'
                      className='bg-blue-500 hover:bg-blue-600 text-white'
                    >
                      Assign Technician
                    </Button>
                    {asset.daysUntilNextMaintenance !== undefined && asset.daysUntilNextMaintenance <= 0 && (
                      <Badge variant='destructive' className='text-xs'>
                        <AlertTriangle className='w-3 h-3 mr-1' />
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialog.isOpen}
        onOpenChange={open => setAssignmentDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Assign Maintenance</DialogTitle>
            <DialogDescription>
              Assign a technician to perform maintenance on {assignmentDialog.asset?.name}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='technician'>Select Technician</Label>
              <select
                id='technician'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                value={assignmentDialog.selectedTechnician || ''}
                onChange={e =>
                  setAssignmentDialog(prev => ({
                    ...prev,
                    selectedTechnician: (e.target.value as Id<'users'>) || null,
                  }))
                }
              >
                <option value=''>Select a technician...</option>
                {technicians?.map(tech => (
                  <option key={tech._id} value={tech._id}>
                    {tech.firstName} {tech.lastName} ({tech.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor='scheduled-date'>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !assignmentDialog.scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {assignmentDialog.scheduledDate ? (
                      format(assignmentDialog.scheduledDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={assignmentDialog.scheduledDate}
                    onSelect={date => setAssignmentDialog(prev => ({ ...prev, scheduledDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Textarea
                id='notes'
                placeholder='Add any specific instructions or notes...'
                value={assignmentDialog.notes}
                onChange={e => setAssignmentDialog(prev => ({ ...prev, notes: e.target.value }))}
                className='min-h-[80px]'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignmentDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={!assignmentDialog.selectedTechnician}
              className='bg-blue-500 hover:bg-blue-600 text-white'
            >
              Assign Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
