import React from 'react';
import { ScrollView, RefreshControl, View, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Wrench, Package, AlertTriangle, TrendingUp, RefreshCw, Calendar, ArrowRight } from 'lucide-react-native';
import { MaintenanceDashboardResponse, AssetInventoryResponse } from '@/lib/tech.types';

export default function TechDashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch dashboard data
  const dashboardData: MaintenanceDashboardResponse | undefined = useQuery(api.tech.getMaintenanceDashboard);
  const assetInventory: AssetInventoryResponse | undefined = useQuery(api.tech.getAssetInventory, {});

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const dashboard = dashboardData?.success ? dashboardData.data : null;
  const assets = assetInventory?.success ? assetInventory.data || [] : [];

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      {/* Header */}
      <View className='pt-12 px-5 pb-3 bg-blue-800 rounded-b-2xl'>
        <View className='flex-row justify-between items-center'>
          <View className='flex-row items-center gap-3'>
            <View className='w-10 h-10 rounded-xl bg-white/20 items-center justify-center'>
              <Icon as={Wrench} size={24} className='text-white' />
            </View>
            <View>
              <Text className='text-2xl font-bold text-white tracking-tight'>Tech Dashboard</Text>
              <Text className='text-sm text-white/80'>Field technician overview</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Icon as={RefreshCw} size={20} className={`text-white ${refreshing ? 'opacity-50' : ''}`} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className='flex-1 w-full'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions - Moved to top */}
        <View className='px-5 pt-6 pb-4'>
          <View className='space-y-3'>
            <Link href='/tech/maintenance-requests' asChild className='mb-2'>
              <TouchableOpacity className='bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm'>
                <View className='flex-row items-center gap-3'>
                  <View className='w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 items-center justify-center'>
                    <Icon as={Wrench} size={24} className='text-blue-600' />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-base font-semibold text-gray-900 dark:text-gray-100'>
                      Maintenance Requests
                    </Text>
                    <Text className='text-sm text-gray-500 dark:text-gray-400'>View and manage work orders</Text>
                  </View>
                  <Icon as={ArrowRight} size={20} className='text-gray-400' />
                </View>
              </TouchableOpacity>
            </Link>

            <Link href='/tech/asset-inventory' asChild>
              <TouchableOpacity className='bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm'>
                <View className='flex-row items-center gap-3'>
                  <View className='w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 items-center justify-center'>
                    <Icon as={Package} size={24} className='text-purple-600' />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-base font-semibold text-gray-900 dark:text-gray-100'>Asset Inventory</Text>
                    <Text className='text-sm text-gray-500 dark:text-gray-400'>Check available equipment</Text>
                  </View>
                  <Icon as={ArrowRight} size={20} className='text-gray-400' />
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Key Metrics - Compact horizontal layout */}
        <View className='px-5 pb-6'>
          <Text className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>Today&apos;s Overview</Text>
          <View className='flex-row gap-3'>
            {/* Overdue Tasks */}
            <View className='flex-1 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 p-4 rounded-2xl border border-red-200/50 dark:border-red-800/50'>
              <View className='flex-row items-center justify-between mb-2'>
                <Icon as={AlertTriangle} size={18} className='text-red-600' />
                <Text className='text-xs font-medium text-red-600'>OVERDUE</Text>
              </View>
              <Text className='text-2xl font-bold text-red-600'>{dashboard?.overdueCount || 0}</Text>
              <Text className='text-xs text-red-500 mt-1'>tasks</Text>
            </View>

            {/* Today's Tasks */}
            <View className='flex-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-800/50'>
              <View className='flex-row items-center justify-between mb-2'>
                <Icon as={Calendar} size={18} className='text-blue-600' />
                <Text className='text-xs font-medium text-blue-600'>TODAY</Text>
              </View>
              <Text className='text-2xl font-bold text-blue-600'>{dashboard?.todaysCount || 0}</Text>
              <Text className='text-xs text-blue-500 mt-1'>scheduled</Text>
            </View>

            {/* This Week */}
            <View className='flex-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-2xl border border-green-200/50 dark:border-green-800/50'>
              <View className='flex-row items-center justify-between mb-2'>
                <Icon as={TrendingUp} size={18} className='text-green-600' />
                <Text className='text-xs font-medium text-green-600'>THIS WEEK</Text>
              </View>
              <Text className='text-2xl font-bold text-green-600'>{dashboard?.thisWeekCount || 0}</Text>
              <Text className='text-xs text-green-500 mt-1'>total</Text>
            </View>
          </View>

          {/* Assets Card */}
          <View className='mt-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Package} size={20} className='text-purple-600' />
                <Text className='text-sm font-medium text-purple-600'>Available Assets</Text>
              </View>
              <Text className='text-2xl font-bold text-purple-600'>{assets?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Priority Overview - Visual representation */}
        {dashboard?.priorityCounts && (
          <View className='px-5 pb-8'>
            <Text className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>Priority Overview</Text>
            <View className='bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm'>
              {/* Priority Progress Bars */}
              <View className='space-y-4'>
                {/* Emergency */}
                <View className='mb-4'>
                  <View className='flex-row items-center justify-between mb-2'>
                    <View className='flex-row items-center gap-2'>
                      <View className='w-3 h-3 rounded-full bg-red-500' />
                      <Text className='text-sm font-medium text-red-600'>Emergency</Text>
                    </View>
                    <Text className='text-sm font-bold text-red-600'>{dashboard.priorityCounts.emergency}</Text>
                  </View>
                  <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <View
                      className='h-full bg-red-500 rounded-full'
                      style={{
                        width: `${Math.min((dashboard.priorityCounts.emergency / Math.max(dashboard.priorityCounts.emergency + dashboard.priorityCounts.high + dashboard.priorityCounts.medium + dashboard.priorityCounts.low, 1)) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* High Priority */}
                <View className='mb-4'>
                  <View className='flex-row items-center justify-between mb-2'>
                    <View className='flex-row items-center gap-2'>
                      <View className='w-3 h-3 rounded-full bg-orange-500' />
                      <Text className='text-sm font-medium text-orange-600'>High</Text>
                    </View>
                    <Text className='text-sm font-bold text-orange-600'>{dashboard.priorityCounts.high}</Text>
                  </View>
                  <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <View
                      className='h-full bg-orange-500 rounded-full'
                      style={{
                        width: `${Math.min((dashboard.priorityCounts.high / Math.max(dashboard.priorityCounts.emergency + dashboard.priorityCounts.high + dashboard.priorityCounts.medium + dashboard.priorityCounts.low, 1)) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Medium Priority */}
                <View className='mb-4'>
                  <View className='flex-row items-center justify-between mb-2'>
                    <View className='flex-row items-center gap-2'>
                      <View className='w-3 h-3 rounded-full bg-yellow-500' />
                      <Text className='text-sm font-medium text-yellow-600'>Medium</Text>
                    </View>
                    <Text className='text-sm font-bold text-yellow-600'>{dashboard.priorityCounts.medium}</Text>
                  </View>
                  <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <View
                      className='h-full bg-yellow-500 rounded-full'
                      style={{
                        width: `${Math.min((dashboard.priorityCounts.medium / Math.max(dashboard.priorityCounts.emergency + dashboard.priorityCounts.high + dashboard.priorityCounts.medium + dashboard.priorityCounts.low, 1)) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Low Priority */}
                <View className='mb-4'>
                  <View className='flex-row items-center justify-between mb-2'>
                    <View className='flex-row items-center gap-2'>
                      <View className='w-3 h-3 rounded-full bg-green-500' />
                      <Text className='text-sm font-medium text-green-600'>Low</Text>
                    </View>
                    <Text className='text-sm font-bold text-green-600'>{dashboard.priorityCounts.low}</Text>
                  </View>
                  <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <View
                      className='h-full bg-green-500 rounded-full'
                      style={{
                        width: `${Math.min((dashboard.priorityCounts.low / Math.max(dashboard.priorityCounts.emergency + dashboard.priorityCounts.high + dashboard.priorityCounts.medium + dashboard.priorityCounts.low, 1)) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
