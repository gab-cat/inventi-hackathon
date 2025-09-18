'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Package, Wrench, AlertTriangle } from 'lucide-react';
import { AssetDashboard, AssetTable, AssetFilters, AddAssetDialog, AssetAlerts } from '@/features/assets';
import { useAssetStore } from '@/stores/asset-store';
import {
  AssetDashboardSkeleton,
  AssetTableSkeleton,
  AssetFiltersSkeleton,
  AssetAlertsSkeleton,
  PropertySelectorSkeleton,
} from '@/features/assets/components/asset-skeletons';

export default function AssetsPage() {
  const [showAddAsset, setShowAddAsset] = useState(false);

  // Authentication state
  const { isLoaded, isSignedIn } = useAuth();

  // Zustand store
  const {
    selectedTab,
    setSelectedTab,
    assetPagination,
    setAssetPagination,
    assetFilters,
    setAssetFilters,
    selectedPropertyId,
    setSelectedPropertyId,
  } = useAssetStore();

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get properties for the current user
  const properties = useAuthenticatedQuery(api.assets.getManagerProperties, {});

  // Get dashboard data
  const dashboardData = useAuthenticatedQuery(api.assets.getAssetDashboardData, {
    propertyId: selectedPropertyId as Id<'properties'> | undefined,
  });

  // Get assets with filters
  const assets = useAuthenticatedQuery(api.assets.getAssets, {
    paginationOpts: { numItems: 10, cursor: assetPagination.cursor },
    propertyId: selectedPropertyId as Id<'properties'> | undefined,
    category: assetFilters.category as any,
    status: assetFilters.status as any,
    condition: assetFilters.condition as any,
    search: assetFilters.search,
  });

  // Get alerts
  const alerts = useAuthenticatedQuery(api.assets.getAssetAlerts, {
    propertyId: selectedPropertyId as Id<'properties'> | undefined,
  });

  // Get total count from dashboard data (which already includes total count)
  // We'll use this as a fallback, but for filtered results we'll need to calculate differently

  const selectedProperty = properties?.find((p: any) => p._id === selectedPropertyId);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // For cursor-based pagination, we'll use a simple approach
    if (page === 1) {
      setAssetPagination({ cursor: null, hasMore: true });
    } else {
      // For pages > 1, we'll use the continueCursor from the current data
      setAssetPagination({ cursor: assets?.continueCursor || null, hasMore: true });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && assets?.continueCursor) {
      setCurrentPage(prev => prev + 1);
      setAssetPagination({ cursor: assets.continueCursor, hasMore: true });
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      // For previous page, we need to reset to first page and then navigate
      // This is a limitation of cursor-based pagination
      setAssetPagination({ cursor: null, hasMore: true });
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    setAssetPagination({ cursor: null, hasMore: true });
  };

  const handleLastPage = () => {
    // For cursor-based pagination, we can't easily jump to the last page
    // This is a limitation we'll need to work with
    setCurrentPage(1);
    setAssetPagination({ cursor: null, hasMore: true });
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setAssetPagination({ cursor: null, hasMore: true });
  };

  // Calculate pagination info
  const itemsPerPage = 10;
  const currentPageAssets = assets?.page.length || 0;

  // If we have a full page (10 items), there might be more data
  // If we have less than 10 items, we're on the last page
  const hasNextPage = currentPageAssets === itemsPerPage && !!assets?.continueCursor;
  const hasPreviousPage = currentPage > 1;
  const shouldShowPagination = hasNextPage || hasPreviousPage || currentPageAssets >= itemsPerPage;

  // Calculate display numbers for pagination
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = startItem + currentPageAssets - 1;

  // For total count, we need to estimate based on current page
  // If we're on the last page (no continueCursor), total = endItem
  // If we have more pages, we can't know the exact total with cursor-based pagination
  // So we'll show a range or use a placeholder
  const estimatedTotal = hasNextPage ? undefined : endItem;

  // For the pagination component, we need to pass the correct total
  // If we know the total (last page), use it; otherwise, don't show total count
  const paginationTotal = hasNextPage ? undefined : endItem;

  // For display purposes, we'll estimate total pages
  const estimatedTotalPages = hasNextPage ? currentPage + 1 : currentPage;

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className='container mx-auto space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className='container mx-auto space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Please sign in to access asset management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Asset Management</h1>
          <p className='text-muted-foreground'>Manage materials, tools, and equipment across your properties</p>
        </div>
        <Button onClick={() => setShowAddAsset(true)} className='gap-2 bg-blue-500 text-white hover:bg-blue-600'>
          <Plus className='h-4 w-4' />
          Add Asset
        </Button>
      </div>

      {/* Property Selector */}
      {properties && properties.length > 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Select Property</CardTitle>
            <CardDescription>Choose a property to view its assets, or view all properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex gap-2 flex-wrap'>
              <Button
                variant={selectedPropertyId === undefined ? 'default' : 'outline'}
                onClick={() => setSelectedPropertyId(undefined)}
              >
                All Properties
              </Button>
              {properties.map((property: any) => (
                <Button
                  key={property._id}
                  variant={selectedPropertyId === property._id ? 'default' : 'outline'}
                  onClick={() => setSelectedPropertyId(property._id)}
                >
                  {property.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : properties === undefined ? (
        <PropertySelectorSkeleton />
      ) : null}

      {/* Alerts */}
      {alerts === undefined ? (
        <AssetAlertsSkeleton />
      ) : alerts && alerts.length > 0 ? (
        <AssetAlerts alerts={alerts} />
      ) : null}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='dashboard' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value='assets' className='gap-2'>
            <Package className='h-4 w-4' />
            Assets
          </TabsTrigger>
          <TabsTrigger value='maintenance' className='gap-2'>
            <Wrench className='h-4 w-4' />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value='reports' className='gap-2'>
            <AlertTriangle className='h-4 w-4' />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          {dashboardData === undefined ? (
            <AssetDashboardSkeleton />
          ) : dashboardData ? (
            <AssetDashboard data={dashboardData} propertyName={selectedProperty?.name || 'All Properties'} />
          ) : null}
        </TabsContent>

        <TabsContent value='assets' className='space-y-6'>
          <div className='flex gap-4'>
            <div className='w-80'>
              {properties === undefined ? (
                <AssetFiltersSkeleton />
              ) : (
                <AssetFilters
                  filters={assetFilters}
                  onFiltersChange={setAssetFilters}
                  properties={properties}
                  selectedPropertyId={selectedPropertyId as Id<'properties'> | undefined}
                  onPropertyChange={setSelectedPropertyId}
                />
              )}
            </div>
            <div className='flex-1'>
              {assets === undefined ? (
                <AssetTableSkeleton />
              ) : assets ? (
                <AssetTable
                  assets={assets.page as any}
                  properties={properties}
                  onRefresh={handleRefresh}
                  currentPage={currentPage}
                  totalPages={estimatedTotalPages}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  total={paginationTotal}
                  limit={itemsPerPage}
                  onPageChange={handlePageChange}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                  onFirstPage={handleFirstPage}
                  onLastPage={handleLastPage}
                  isLoading={isLoading}
                />
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='maintenance' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>View and manage asset maintenance schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>Maintenance management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reports' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate reports and view analytics for your assets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>Reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={showAddAsset}
        onOpenChange={setShowAddAsset}
        properties={properties}
        selectedPropertyId={selectedPropertyId as Id<'properties'> | undefined}
      />
    </div>
  );
}
