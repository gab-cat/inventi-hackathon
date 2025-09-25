import React from 'react';
import { ScrollView, RefreshControl, View, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import {
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Package,
  TrendingUp,
  Wrench,
  Scan,
} from 'lucide-react-native';
import { MaintenanceDashboardResponse, AssetInventoryResponse } from '@/lib/tech.types';

// Action button configuration
const ACTION_BUTTONS = [
  {
    id: 'maintenance-requests',
    href: '/tech/maintenance-requests',
    icon: Wrench,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Maintenance Requests',
    description: 'View and manage work orders',
  },
  {
    id: 'asset-inventory',
    href: '/tech/asset-inventory',
    icon: Package,
    iconColor: 'text-purple-600',
    iconBgColor: 'bg-purple-50 dark:bg-purple-950/30',
    title: 'Asset Inventory',
    description: 'Check available equipment',
  },
  {
    id: 'asset-checkin',
    href: '/tech/asset-checkin',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBgColor: 'bg-green-50 dark:bg-green-950/30',
    title: 'Asset Check-in',
    description: 'Return equipment to inventory',
  },
  {
    id: 'asset-checkout',
    href: '/tech/asset-checkout',
    icon: Scan,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Asset Checkout',
    description: 'Check out equipment for use',
  },
  {
    id: 'asset-maintenance',
    href: '/tech/asset-maintenance',
    icon: Wrench,
    iconColor: 'text-orange-600',
    iconBgColor: 'bg-orange-50 dark:bg-orange-950/30',
    title: 'Asset Maintenance',
    description: 'Track and schedule maintenance',
  },
] as const;

// Metric card configuration
const METRIC_CARDS = [
  {
    id: 'overdue',
    key: 'overdueCount' as const,
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    label: 'OVERDUE',
    labelColor: 'text-red-600',
    valueColor: 'text-red-600',
    subtitle: 'tasks',
    subtitleColor: 'text-red-500',
    gradient: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20',
    borderColor: 'border-red-200/50 dark:border-red-800/50',
  },
  {
    id: 'today',
    key: 'todaysCount' as const,
    icon: Calendar,
    iconColor: 'text-blue-600',
    label: 'TODAY',
    labelColor: 'text-blue-600',
    valueColor: 'text-blue-600',
    subtitle: 'scheduled',
    subtitleColor: 'text-blue-500',
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
    borderColor: 'border-blue-200/50 dark:border-blue-800/50',
  },
  {
    id: 'this-week',
    key: 'thisWeekCount' as const,
    icon: TrendingUp,
    iconColor: 'text-green-600',
    label: 'THIS WEEK',
    labelColor: 'text-green-600',
    valueColor: 'text-green-600',
    subtitle: 'total',
    subtitleColor: 'text-green-500',
    gradient: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20',
    borderColor: 'border-green-200/50 dark:border-green-800/50',
  },
] as const;

// Priority configuration
const PRIORITY_ITEMS = [
  {
    id: 'emergency',
    key: 'emergency',
    label: 'Emergency',
    color: 'red',
    bgColor: 'bg-red-500',
    textColor: 'text-red-600',
  },
  {
    id: 'high',
    key: 'high',
    label: 'High',
    color: 'orange',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
  {
    id: 'medium',
    key: 'medium',
    label: 'Medium',
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
  },
  {
    id: 'low',
    key: 'low',
    label: 'Low',
    color: 'green',
    bgColor: 'bg-green-500',
    textColor: 'text-green-600',
  },
] as const;

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
      <PageHeader
        title='Tech Dashboard'
        subtitle='Field technician overview'
        type='root'
        rightSlot={
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Icon as={RefreshCw} size={20} className={`text-white ${refreshing ? 'opacity-50' : ''}`} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className='flex-1 w-full'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions - Moved to top */}
        <View className='px-5 pt-6 pb-4'>
          <View className='space-y-3'>
            {ACTION_BUTTONS.map(button => (
              <Link key={button.id} href={button.href} asChild>
                <TouchableOpacity className='bg-white dark:bg-gray-800 p-4 mb-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm'>
                  <View className='flex-row items-center gap-3'>
                    <View className={`w-12 h-12 rounded-xl ${button.iconBgColor} items-center justify-center`}>
                      <Icon as={button.icon} size={24} className={button.iconColor} />
                    </View>
                    <View className='flex-1'>
                      <Text className='text-base font-semibold text-gray-900 dark:text-gray-100'>{button.title}</Text>
                      <Text className='text-sm text-gray-500 dark:text-gray-400'>{button.description}</Text>
                    </View>
                    <Icon as={ArrowRight} size={20} className='text-gray-400' />
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Key Metrics - Compact horizontal layout */}
        <View className='px-5 pb-6'>
          <Text className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>Today&apos;s Overview</Text>
          <View className='flex-row gap-3'>
            {METRIC_CARDS.map(card => (
              <View
                key={card.id}
                className={`flex-1 bg-gradient-to-br ${card.gradient} p-4 rounded-2xl border ${card.borderColor}`}
              >
                <View className='flex-row items-center justify-between mb-2'>
                  <Icon as={card.icon} size={18} className={card.iconColor} />
                  <Text className={`text-xs font-medium ${card.labelColor}`}>{card.label}</Text>
                </View>
                <Text className={`text-2xl font-bold ${card.valueColor}`}>{(dashboard as any)?.[card.key] || 0}</Text>
                <Text className={`text-xs ${card.subtitleColor} mt-1`}>{card.subtitle}</Text>
              </View>
            ))}
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
                {PRIORITY_ITEMS.map(priority => {
                  const total =
                    dashboard.priorityCounts.emergency +
                    dashboard.priorityCounts.high +
                    dashboard.priorityCounts.medium +
                    dashboard.priorityCounts.low;
                  const count = dashboard.priorityCounts[priority.key as keyof typeof dashboard.priorityCounts] || 0;
                  const percentage = Math.min((count / Math.max(total, 1)) * 100, 100);

                  return (
                    <View key={priority.id} className='mb-4'>
                      <View className='flex-row items-center justify-between mb-2'>
                        <View className='flex-row items-center gap-2'>
                          <View className={`w-3 h-3 rounded-full ${priority.bgColor}`} />
                          <Text className={`text-sm font-medium ${priority.textColor}`}>{priority.label}</Text>
                        </View>
                        <Text className={`text-sm font-bold ${priority.textColor}`}>{count}</Text>
                      </View>
                      <View className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                        <View
                          className={`h-full ${priority.bgColor} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
