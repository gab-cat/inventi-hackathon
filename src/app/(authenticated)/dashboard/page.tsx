'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, BarChart3, Activity, Zap, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { usePropertyStore } from '@/features/property';
import { useDashboardAnalytics } from '@/features/dashboard';
import { DashboardOverview, MaintenanceMetrics, ActivityTrends, QuickActions } from '@/features/dashboard/components';

export default function DashboardPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get dashboard analytics
  const { analytics, isLoading, error } = useDashboardAnalytics({
    propertyId: selectedPropertyId!,
  });

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // The query will automatically refetch due to Convex reactivity
  };

  if (!selectedPropertyId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Card className='w-96'>
          <CardContent className='p-6 text-center'>
            <LayoutDashboard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Property Selected</h3>
            <p className='text-muted-foreground'>Please select a property from the sidebar to view the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Card className='w-96'>
          <CardContent className='p-6 text-center'>
            <LayoutDashboard className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Error Loading Dashboard</h3>
            <p className='text-muted-foreground mb-4'>There was an error loading the dashboard data.</p>
            <Button onClick={handleRefresh} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>Property management overview and analytics</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant='outline' size='sm' onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-8 w-1/2' />
                    <Skeleton className='h-3 w-full' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <Skeleton className='h-64 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {analytics && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <LayoutDashboard className='h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='maintenance' className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value='trends' className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              Trends
            </TabsTrigger>
            <TabsTrigger value='actions' className='flex items-center gap-2'>
              <Zap className='h-4 w-4' />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            <DashboardOverview
              propertyOverview={analytics.propertyOverview}
              financialMetrics={analytics.financialMetrics}
            />
          </TabsContent>

          <TabsContent value='maintenance' className='space-y-6'>
            <MaintenanceMetrics maintenanceMetrics={analytics.maintenanceMetrics} />
          </TabsContent>

          <TabsContent value='trends' className='space-y-6'>
            <ActivityTrends trends={analytics.trends} />
          </TabsContent>

          <TabsContent value='actions' className='space-y-6'>
            <QuickActions
              unreadMessages={analytics.communicationMetrics.unreadMessages}
              pendingVisitorRequests={analytics.visitorMetrics.pendingApprovals}
              pendingDeliveries={analytics.deliveryMetrics.pendingCollections}
              activeMaintenanceRequests={analytics.maintenanceMetrics.totalRequests}
              emergencyRequests={analytics.maintenanceMetrics.emergencyRequests}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
