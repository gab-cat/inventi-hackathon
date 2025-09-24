'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, BarChart3, Activity, Zap, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePropertyStore } from '@/features/property';
import { useDashboardAnalytics } from '@/features/dashboard';
import { DashboardOverview, MaintenanceMetrics, ActivityTrends, QuickActions } from '@/features/dashboard/components';
import { Id } from '@convex/_generated/dataModel';

export default function DashboardPage() {
  const { selectedPropertyId } = usePropertyStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get dashboard analytics
  const { analytics, isLoading, error } = useDashboardAnalytics({
    propertyId: selectedPropertyId as Id<'properties'>,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='container mx-auto space-y-6'
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className='flex items-center justify-between'
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className='text-xl font-bold tracking-tight'
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className='text-muted-foreground'
          >
            Property management overview and analytics
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className='flex items-center gap-2'
        >
          <Badge variant='outline' className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant='outline' size='sm' onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className='p-6'>
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-8 w-1/2' />
                        <Skeleton className='h-3 w-full' />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (i + 4) * 0.1 }}
                >
                  <Card>
                    <CardContent className='p-6'>
                      <Skeleton className='h-64 w-full' />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Content */}
      {analytics && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4'>
            <TabsTrigger value='overview' className='flex items-center gap-1 sm:gap-2'>
              <LayoutDashboard className='h-4 w-4' />
              <span className='hidden sm:inline'>Overview</span>
            </TabsTrigger>
            <TabsTrigger value='maintenance' className='flex items-center gap-1 sm:gap-2'>
              <BarChart3 className='h-4 w-4' />
              <span className='hidden sm:inline'>Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value='trends' className='flex items-center gap-1 sm:gap-2'>
              <TrendingUp className='h-4 w-4' />
              <span className='hidden sm:inline'>Trends</span>
            </TabsTrigger>
            <TabsTrigger value='actions' className='flex items-center gap-1 sm:gap-2'>
              <Zap className='h-4 w-4' />
              <span className='hidden sm:inline'>Quick Actions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <DashboardOverview
                propertyOverview={analytics.propertyOverview}
                financialMetrics={analytics.financialMetrics}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value='maintenance' className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <MaintenanceMetrics maintenanceMetrics={analytics.maintenanceMetrics} />
            </motion.div>
          </TabsContent>

          <TabsContent value='trends' className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ActivityTrends trends={analytics.trends} />
            </motion.div>
          </TabsContent>

          <TabsContent value='actions' className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <QuickActions
                unreadMessages={analytics.communicationMetrics.unreadMessages}
                pendingVisitorRequests={analytics.visitorMetrics.pendingApprovals}
                pendingDeliveries={analytics.deliveryMetrics.pendingCollections}
                activeMaintenanceRequests={analytics.maintenanceMetrics.totalRequests}
                emergencyRequests={analytics.maintenanceMetrics.emergencyRequests}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
