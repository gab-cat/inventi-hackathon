'use client';

import { useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoticeFilters } from '@/features/noticeboard/components/notice-filters';
import { NoticeList } from '@/features/noticeboard/components/notice-list';
import { NoticeCreateModal } from '@/features/noticeboard/components/notice-create-modal';
import { NoticeEditModal } from '@/features/noticeboard/components/notice-edit-modal';
import { NoticeDetailSheet } from '@/features/noticeboard/components/notice-detail-sheet';
import { useNotices } from '@/features/noticeboard/hooks/useNotices';
import { useNoticeMutations } from '@/features/noticeboard/hooks/useNoticeMutations';
import { useNoticeDetail } from '@/features/noticeboard/hooks/useNoticeDetail';
import { useAllUnits } from '@/features/noticeboard/hooks/useAllUnits';
import { useManagerProperties } from '@/features/noticeboard/hooks/useManagerProperties';
import { usePropertyStore } from '@/features/property';
import { CreateNoticeForm, UpdateNoticeForm, NoticeWithDetails } from '@/features/noticeboard/types';

export default function NoticeboardPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeWithDetails | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Id<'notices'> | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Id<'notices'> | null>(null);

  // Hooks
  const {
    notices,
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
  } = useNotices({ propertyId: selectedPropertyId });
  const { properties, isLoading: propertiesLoading } = useManagerProperties();
  const { units, isLoading: unitsLoading } = useAllUnits(selectedPropertyId);
  const {
    createNotice,
    updateNotice,
    deleteNotice,
    isLoading: mutationLoading,
    error: mutationError,
  } = useNoticeMutations();

  const { notice: noticeDetail } = useNoticeDetail(viewingNotice);

  // Event handlers
  const handleCreateNotice = async (data: CreateNoticeForm) => {
    try {
      await createNotice(data);
    } catch (error) {
      console.error('Failed to create notice:', error);
    }
  };

  const handleUpdateNotice = async (noticeId: string, data: UpdateNoticeForm) => {
    try {
      await updateNotice(noticeId as Id<'notices'>, data);
    } catch (error) {
      console.error('Failed to update notice:', error);
    }
  };

  const handleDeleteNotice = async (noticeId: Id<'notices'>) => {
    try {
      await deleteNotice(noticeId);
      setDeletingNotice(null);
    } catch (error) {
      console.error('Failed to delete notice:', error);
    }
  };

  const handleNoticeAction = (
    action: 'view' | 'edit' | 'delete' | 'acknowledge',
    notice: NoticeWithDetails | { _id: Id<'notices'> }
  ) => {
    switch (action) {
      case 'view':
        setViewingNotice(notice._id);
        break;
      case 'edit':
        setEditingNotice(notice as NoticeWithDetails);
        break;
      case 'delete':
        setDeletingNotice(notice._id);
        break;
      case 'acknowledge':
        // Handle acknowledgment logic here
        console.log('Acknowledging notice:', notice._id);
        break;
    }
  };

  const handleCloseModal = () => {
    setViewingNotice(null);
    setEditingNotice(null);
    setDeletingNotice(null);
  };

  // Get units for the selected property
  const selectedPropertyUnits = properties.find(p => p._id === filters.propertyId)?.occupiedUnits || 0;

  // Show message if no property is selected
  if (!selectedPropertyId) {
    return (
      <div className='container mx-auto pb-6 space-y-6'>
        <div>
          <h1 className='text-xl font-bold'>Noticeboard Management</h1>
          <p className='text-muted-foreground'>Please select a property from the sidebar to view notices</p>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
              <MessageSquare className='w-8 h-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground'>No Property Selected</h3>
              <p className='text-sm text-muted-foreground'>
                Use the property selector in the sidebar to choose a property and view its notices.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto pb-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>Noticeboard Management</h1>
          <p className='text-muted-foreground'>Create and manage notices for the selected property</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className='flex bg-blue-500 hover:bg-blue-600 text-white items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          Create Notice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard
          title='Total Notices'
          value={notices.length}
          description='Across all properties'
          icon={MessageSquare}
        />
        <StatCard
          title='Active Notices'
          value={notices.filter(n => n.isActive).length}
          description='Currently active'
          icon={MessageSquare}
        />
        <StatCard title='Properties' value={properties.length} description='Managed properties' icon={MessageSquare} />
        <StatCard
          title='Total Recipients'
          value={notices.reduce((sum, notice) => sum + notice.totalTargetUsers, 0)}
          description='Across all notices'
          icon={MessageSquare}
        />
      </div>

      <div className='space-y-4'>
        <NoticeFilters filters={filters} onFiltersChange={setFilters} properties={properties} units={units} />

        <NoticeList
          notices={notices}
          isLoading={isLoading}
          onLoadMore={loadMore}
          hasMore={hasMore}
          onNoticeAction={handleNoticeAction}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>

      {/* Modals and Sheets */}
      <NoticeCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateNotice}
        isLoading={mutationLoading}
        properties={properties}
        units={units}
      />

      <NoticeEditModal
        notice={editingNotice}
        isOpen={!!editingNotice}
        onClose={() => setEditingNotice(null)}
        onSubmit={handleUpdateNotice}
        isLoading={mutationLoading}
        properties={properties}
        units={units}
      />

      <NoticeDetailSheet
        notice={noticeDetail}
        isOpen={!!viewingNotice}
        onClose={() => setViewingNotice(null)}
        onEdit={notice => {
          setViewingNotice(null);
          setEditingNotice(notice as NoticeWithDetails);
        }}
        onDelete={noticeId => {
          setViewingNotice(null);
          setDeletingNotice(noticeId as Id<'notices'>);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingNotice && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Delete Notice</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>Are you sure you want to delete this notice? This action cannot be undone.</p>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={() => handleDeleteNotice(deletingNotice)}
                  disabled={mutationLoading}
                >
                  {mutationLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
