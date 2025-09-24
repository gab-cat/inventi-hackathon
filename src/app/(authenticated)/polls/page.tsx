'use client';

import { useState } from 'react';
import { Plus, BarChart3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePropertyStore } from '@/features/property';
import { usePolls, usePollWithResponses, usePollStats, usePollResponseCounts } from '@/features/polls/hooks/usePolls';
import { CreatePollModal } from '@/features/polls/components/create-poll-modal';
import { EditPollModal } from '@/features/polls/components/edit-poll-modal';
import { PollList } from '@/features/polls/components/poll-list';
import { PollDetailSheet } from '@/features/polls/components/poll-detail-sheet';
import { PollPagination } from '@/features/polls/components/poll-pagination';
import { Poll, PollWithResponses } from '@/features/polls/types';
import { Id } from '@convex/_generated/dataModel';
import { motion } from 'framer-motion';

export default function PollsPage() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showEditPoll, setShowEditPoll] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedPropertyId } = usePropertyStore();

  const { polls, isLoading, error, refetch } = usePolls(selectedPropertyId!);

  // Check if the selected poll still exists in the polls list
  const selectedPollExists = selectedPoll && polls.some(p => p._id === selectedPoll._id);
  const pollIdToFetch = selectedPollExists ? selectedPoll._id : null;

  const { poll: pollWithResponses, isLoading: pollLoading } = usePollWithResponses(pollIdToFetch);
  const { stats: pollStats, isLoading: statsLoading } = usePollStats(pollIdToFetch);
  const { responseCounts, isLoading: responseCountsLoading } = usePollResponseCounts(selectedPropertyId);

  // Pagination settings
  const itemsPerPage = 10;
  const totalPages = Math.ceil(polls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPolls = polls.slice(startIndex, endIndex);

  // Response counts are now fetched from the hook

  const handlePollCreated = () => {
    refetch();
    setShowCreatePoll(false);
  };

  const handleViewResults = (poll: Poll) => {
    setSelectedPoll(poll);
    setShowDetailSheet(true);
  };

  const handleEditPoll = (poll: Poll) => {
    // Set the poll to edit directly from the poll card data
    // We'll need to fetch the full poll data with responses
    setSelectedPoll(poll);
    setShowEditPoll(true);
  };

  const handleEditFromSheet = (poll: PollWithResponses) => {
    setSelectedPoll(poll);
    setShowEditPoll(true);
  };

  const handlePollUpdated = () => {
    refetch();
    setShowEditPoll(false);
  };

  const handleCloseDetailSheet = () => {
    setShowDetailSheet(false);
    setSelectedPoll(null);
  };

  const handlePollDeleted = () => {
    // Close the detail sheet and clear selected poll when a poll is deleted
    setShowDetailSheet(false);
    setSelectedPoll(null);
    refetch();
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  if (!selectedPropertyId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>Select a Property</h3>
            <p className='text-muted-foreground text-center'>
              Please select a property from the sidebar to view and manage polls.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='container mx-auto pb-6 space-y-4 md:space-y-6'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'
      >
        <div className='space-y-1'>
          <h1 className='text-xl font-bold'>Polls</h1>
          <p className='text-sm md:text-base text-muted-foreground'>
            Create and manage polls to gather feedback from your tenants
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePoll(true)}
          className='w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white'
        >
          <Plus className='h-4 w-4 mr-2' />
          Create Poll
        </Button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className='space-y-4 md:space-y-6'
      >
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className='h-4 bg-muted rounded animate-pulse' />
                  <div className='h-3 bg-muted rounded animate-pulse w-2/3' />
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='h-3 bg-muted rounded animate-pulse' />
                    <div className='h-3 bg-muted rounded animate-pulse w-1/2' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <MessageSquare className='h-12 w-12 text-destructive mb-4' />
              <h3 className='text-lg font-medium mb-2'>Error Loading Polls</h3>
              <p className='text-muted-foreground text-center mb-4'>{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <PollList
              polls={paginatedPolls}
              onEditPoll={handleEditPoll}
              onViewResults={handleViewResults}
              onRefresh={refetch}
              responseCounts={responseCounts}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <PollPagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={currentPage < totalPages}
                hasPreviousPage={currentPage > 1}
                onPageChange={handlePageChange}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
                onFirstPage={handleFirstPage}
                onLastPage={handleLastPage}
                isLoading={isLoading}
                total={polls.length}
                limit={itemsPerPage}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Poll Detail Sheet */}
      <PollDetailSheet
        poll={pollWithResponses || null}
        stats={pollStats || null}
        isOpen={showDetailSheet}
        onClose={handleCloseDetailSheet}
        onEdit={handleEditFromSheet}
        onRefresh={refetch}
        onPollDeleted={handlePollDeleted}
      />

      {/* Create Poll Modal */}
      <CreatePollModal
        open={showCreatePoll}
        onOpenChange={setShowCreatePoll}
        propertyId={selectedPropertyId}
        onPollCreated={handlePollCreated}
      />

      {/* Edit Poll Modal */}
      <EditPollModal
        poll={selectedPoll}
        open={showEditPoll}
        onOpenChange={setShowEditPoll}
        onPollUpdated={handlePollUpdated}
      />
    </motion.div>
  );
}
