'use client';

import { useState } from 'react';
import { Plus, Package, FileText, BarChart3 } from 'lucide-react';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DeliveryFilters,
  DeliveryList,
  DeliveryCreateModal,
  DeliveryDetailSheet,
  DeliveryLogsList,
  DeliveryUpdateStatusModal,
  DeliveryEditModal,
  DeliveryAssignModal,
  DeliveryListSkeleton,
  DeliveryStatsSkeleton,
} from '@/features/delivery/components';
import { useManagerProperties } from '@/features/noticeboard/hooks/useManagerProperties';
import { useAllUnits } from '@/features/noticeboard/hooks/useAllUnits';
import { usePropertyStore } from '@/features/property';
import { CreateDeliveryForm, UpdateDeliveryForm, DeliveryWithDetails } from '@/features/delivery/types';
import { useDeliveries, useDeliveryLogs, useDeliveryMutations } from '@/features/delivery';

export default function DeliveriesPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingDelivery, setViewingDelivery] = useState<Id<'deliveries'> | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<DeliveryWithDetails | null>(null);
  const [assigningDelivery, setAssigningDelivery] = useState<Id<'deliveries'> | null>(null);
  const [updatingStatusDelivery, setUpdatingStatusDelivery] = useState<Id<'deliveries'> | null>(null);
  const [activeTab, setActiveTab] = useState('deliveries');

  // Hooks
  const {
    deliveries,
    isLoading,
    hasMore,
    loadMore,
    filters,
    setFilters,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
  } = useDeliveries({ propertyId: selectedPropertyId });

  const {
    deliveryLogs,
    isLoading: logsLoading,
    hasMore: logsHasMore,
    loadMore: logsLoadMore,
    filters: logsFilters,
    setFilters: setLogsFilters,
  } = useDeliveryLogs({ propertyId: selectedPropertyId });

  const { properties, isLoading: propertiesLoading } = useManagerProperties();
  const { units, isLoading: unitsLoading } = useAllUnits(selectedPropertyId);
  const {
    registerDelivery,
    assignDeliveryToRecipient,
    markDeliveryAsCollected,
    updateDeliveryStatus,
    isLoading: mutationLoading,
    error: mutationError,
  } = useDeliveryMutations();

  // Event handlers
  const handleCreateDelivery = async (data: CreateDeliveryForm) => {
    try {
      await registerDelivery(data);
      setShowCreateModal(false);
    } catch (error) {
      // Error handling is now done in the mutation hook with toast notifications
    }
  };

  const handleDeliveryAction = (
    action: 'view' | 'assign' | 'collect' | 'update_status' | 'edit',
    delivery: DeliveryWithDetails | { _id: Id<'deliveries'> }
  ) => {
    switch (action) {
      case 'view':
        setViewingDelivery(delivery._id);
        break;
      case 'assign':
        setAssigningDelivery(delivery._id);
        break;
      case 'collect':
        // Handle collection logic here
        console.log('Collecting delivery:', delivery._id);
        break;
      case 'update_status':
        setUpdatingStatusDelivery(delivery._id);
        break;
      case 'edit':
        setEditingDelivery(delivery as DeliveryWithDetails);
        break;
    }
  };

  const handleAssignDelivery = async (data: { unitId: string; notes?: string }) => {
    if (!assigningDelivery) return;
    try {
      await assignDeliveryToRecipient({
        deliveryId: assigningDelivery,
        unitId: data.unitId,
        notes: data.notes,
      });
      setAssigningDelivery(null);
    } catch (error) {
      // Error handling is now done in the mutation hook with toast notifications
    }
  };

  const handleUpdateDeliveryStatus = async (data: { status: string; notes?: string; actualDelivery?: string }) => {
    if (!updatingStatusDelivery) return;
    try {
      await updateDeliveryStatus(updatingStatusDelivery, {
        status: data.status as any,
        notes: data.notes,
        actualDelivery: data.actualDelivery,
      });
      setUpdatingStatusDelivery(null);
    } catch (error) {
      // Error handling is now done in the mutation hook with toast notifications
    }
  };

  const handleEditDelivery = async (data: any) => {
    if (!editingDelivery) return;
    try {
      // This would need to be implemented in the mutations
      console.log('Editing delivery:', editingDelivery._id, data);
      setEditingDelivery(null);
    } catch (error) {
      // Error handling is now done in the mutation hook with toast notifications
    }
  };

  const handleCloseModal = () => {
    setViewingDelivery(null);
  };

  // Show message if no property is selected
  if (!selectedPropertyId) {
    return (
      <div className='container mx-auto pb-6 space-y-6'>
        <div>
          <h1 className='text-xl font-bold'>Delivery Management</h1>
          <p className='text-muted-foreground'>Please select a property from the sidebar to view deliveries</p>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
              <Package className='w-8 h-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground'>No Property Selected</h3>
              <p className='text-sm text-muted-foreground'>
                Use the property selector in the sidebar to choose a property and view its deliveries.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalDeliveries = deliveries.length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'registered').length;
  const inTransitDeliveries = deliveries.filter(d => d.status === 'arrived').length;
  const collectedDeliveries = deliveries.filter(d => d.status === 'collected').length;

  return (
    <div className='container mx-auto pb-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>Delivery Management</h1>
          <p className='text-muted-foreground'>Track and manage deliveries for the selected property</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className='flex bg-blue-500 hover:bg-blue-600 text-white items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          Register Delivery
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard title='Total Deliveries' value={totalDeliveries} description='All time' icon={Package} />
        <StatCard title='Pending' value={pendingDeliveries} description='Awaiting assignment' icon={Package} />
        <StatCard title='In Transit' value={inTransitDeliveries} description='Assigned to units' icon={Package} />
        <StatCard title='Collected' value={collectedDeliveries} description='Successfully delivered' icon={Package} />
      </div>

      {/* Tabs for Deliveries and Logs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='deliveries' className='flex items-center gap-2'>
            <Package className='w-4 h-4' />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value='logs' className='flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='deliveries' className='space-y-4'>
          <DeliveryFilters filters={filters} onFiltersChange={setFilters} properties={properties} units={units} />

          <DeliveryList
            deliveries={deliveries}
            isLoading={isLoading}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onDeliveryAction={handleDeliveryAction}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </TabsContent>

        <TabsContent value='logs' className='space-y-4'>
          <DeliveryLogsList
            logs={deliveryLogs}
            isLoading={logsLoading}
            onLoadMore={logsLoadMore}
            hasMore={logsHasMore}
            filters={logsFilters}
            onFiltersChange={setLogsFilters}
          />
        </TabsContent>
      </Tabs>

      {/* Modals and Sheets */}
      <DeliveryCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDelivery}
        isLoading={mutationLoading}
        properties={properties}
        units={units}
      />

      <DeliveryDetailSheet
        deliveryId={viewingDelivery}
        isOpen={!!viewingDelivery}
        onClose={() => setViewingDelivery(null)}
        onAssign={deliveryId => {
          setViewingDelivery(null);
          setAssigningDelivery(deliveryId);
        }}
        onCollect={deliveryId => {
          setViewingDelivery(null);
          // Handle collection logic
          console.log('Collecting delivery:', deliveryId);
        }}
        onUpdateStatus={deliveryId => {
          setViewingDelivery(null);
          setUpdatingStatusDelivery(deliveryId);
        }}
      />

      <DeliveryAssignModal
        isOpen={!!assigningDelivery}
        onClose={() => setAssigningDelivery(null)}
        onSubmit={handleAssignDelivery}
        isLoading={mutationLoading}
        deliveryId={assigningDelivery!}
        units={units}
      />

      <DeliveryUpdateStatusModal
        isOpen={!!updatingStatusDelivery}
        onClose={() => setUpdatingStatusDelivery(null)}
        onSubmit={handleUpdateDeliveryStatus}
        isLoading={mutationLoading}
        currentStatus={deliveries.find(d => d._id === updatingStatusDelivery)?.status || 'pending'}
        deliveryId={updatingStatusDelivery!}
      />

      <DeliveryEditModal
        delivery={editingDelivery}
        isOpen={!!editingDelivery}
        onClose={() => setEditingDelivery(null)}
        onSubmit={handleEditDelivery}
        isLoading={mutationLoading}
        units={units}
      />

      {/* Error Display */}
      {mutationError && (
        <div className='fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg'>
          <p className='font-medium'>Error</p>
          <p className='text-sm'>{mutationError}</p>
        </div>
      )}
    </div>
  );
}
