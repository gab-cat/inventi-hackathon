'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { usePropertyStore } from '@/features/property/stores/property-store';
import {
  VisitorTable,
  VisitorFilters,
  CreateVisitorModal,
  ActiveVisitorsCard,
  VisitorStats,
  useVisitorQueries,
} from '@/features/visitor';
import { useManagerProperties } from '@/features/noticeboard/hooks/useManagerProperties';
import { useAllUnits } from '@/features/noticeboard/hooks/useAllUnits';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';
import { motion } from 'framer-motion';

export default function VisitorsPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<Id<'units'> | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const { properties } = useManagerProperties();
  const { units } = useAllUnits(selectedPropertyId);

  const selectedProperty = properties?.find(p => p._id === selectedPropertyId);

  // Fetch visitor data
  const visitors = useQuery(
    api.visitorRequest.webSearchVisitorHistory,
    selectedPropertyId
      ? {
          propertyId: selectedPropertyId,
          searchTerm: filters.searchTerm || undefined,
          status: filters.status || undefined,
          startDate: filters.startDate?.getTime(),
          endDate: filters.endDate?.getTime(),
          limit: 100,
        }
      : 'skip'
  );

  const activeVisitors = useQuery(
    api.visitorRequest.webGetActiveVisitors,
    selectedPropertyId ? { propertyId: selectedPropertyId } : 'skip'
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSelectedUnitId(null);
    handleRefresh();
  };

  const handleCreateVisitor = () => {
    if (units && units.length > 0) {
      setSelectedUnitId(units[0]._id);
      setShowCreateModal(true);
    }
  };

  if (!selectedProperty) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center py-12'>
          <h2 className='text-2xl font-semibold mb-4'>No Property Selected</h2>
          <p className='text-muted-foreground'>Please select a property to manage visitors.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='container mx-auto p-6 space-y-6'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className='flex items-center justify-between'
      >
        <div>
          <h1 className='text-3xl font-bold'>Visitor Management</h1>
          <p className='text-muted-foreground'>Manage visitor requests and access for {selectedProperty.name}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </Button>
          <Button onClick={handleCreateVisitor}>
            <Plus className='w-4 h-4 mr-2' />
            Create Visitor Entry
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      {visitors && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <VisitorStats visitors={visitors} activeVisitors={activeVisitors?.length || 0} />
        </motion.div>
      )}

      {/* Active Visitors */}
      {activeVisitors && activeVisitors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ActiveVisitorsCard activeVisitors={activeVisitors} onRefresh={handleRefresh} />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <VisitorFilters onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />
      </motion.div>

      {/* Visitor Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {visitors ? (
          <VisitorTable visitors={visitors} onRefresh={handleRefresh} />
        ) : (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>Loading visitors...</p>
          </div>
        )}
      </motion.div>

      {/* Create Visitor Modal */}
      {showCreateModal && selectedUnitId && selectedPropertyId && (
        <CreateVisitorModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          propertyId={selectedPropertyId}
          unitId={selectedUnitId}
          onSuccess={handleCreateSuccess}
        />
      )}
    </motion.div>
  );
}
