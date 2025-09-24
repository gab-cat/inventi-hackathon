'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Calendar, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { MaintenanceDueList } from './maintenance-due-list';
import { useAssetMaintenanceMutations } from '../hooks/useAssetMaintenanceMutations';

interface MaintenanceDueDashboardProps {
  propertyId: Id<'properties'>;
}

export function MaintenanceDueDashboard({ propertyId }: MaintenanceDueDashboardProps) {
  const [daysBeforeDue, setDaysBeforeDue] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { assignMaintenance } = useAssetMaintenanceMutations();

  // Get assets nearing maintenance
  const assetsNearingMaintenance = useAuthenticatedQuery(api.assets.webGetAssetsNearingMaintenance, {
    propertyId,
    daysBeforeDue,
  });

  // Get technicians for assignment
  const technicians = useAuthenticatedQuery(api.assets.webGetTechnicians, {
    propertyId,
  });

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // The query will automatically refetch due to Convex reactivity
  };

  const handleAssignMaintenance = async (
    assetId: Id<'assets'>,
    technicianId: Id<'users'>,
    scheduledDate?: number,
    notes?: string
  ) => {
    await assignMaintenance(assetId, technicianId, scheduledDate, notes);
    handleRefresh();
  };

  // Calculate summary statistics
  const totalAssets = assetsNearingMaintenance?.length || 0;
  const overdueAssets =
    assetsNearingMaintenance?.filter(
      asset => asset.daysUntilNextMaintenance !== undefined && asset.daysUntilNextMaintenance <= 0
    ).length || 0;
  const urgentAssets =
    assetsNearingMaintenance?.filter(
      asset => asset.daysUntilNextMaintenance !== undefined && asset.daysUntilNextMaintenance <= 2
    ).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='space-y-6'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className='flex items-center justify-between'
      >
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Maintenance Due</h2>
          <p className='text-muted-foreground'>Assets requiring maintenance in the next {daysBeforeDue} days</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-1' />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-4 gap-4'
      >
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Wrench className='w-4 h-4 text-blue-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Due</p>
                <p className='text-2xl font-bold'>{totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center'>
                <AlertTriangle className='w-4 h-4 text-red-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Overdue</p>
                <p className='text-2xl font-bold text-red-600'>{overdueAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Clock className='w-4 h-4 text-orange-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Urgent</p>
                <p className='text-2xl font-bold text-orange-600'>{urgentAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-4 h-4 text-green-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Scheduled</p>
                <p className='text-2xl font-bold text-green-600'>{totalAssets - urgentAssets - overdueAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <label htmlFor='days-before' className='text-sm font-medium'>
                  Show assets due within:
                </label>
                <Select value={daysBeforeDue.toString()} onValueChange={value => setDaysBeforeDue(parseInt(value))}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='3'>3 days</SelectItem>
                    <SelectItem value='7'>7 days</SelectItem>
                    <SelectItem value='14'>14 days</SelectItem>
                    <SelectItem value='30'>30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Assets Requiring Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceDueList
              assets={assetsNearingMaintenance || []}
              isLoading={assetsNearingMaintenance === undefined}
              propertyId={propertyId}
              onAssignMaintenance={handleAssignMaintenance}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
