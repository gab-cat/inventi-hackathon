import React from 'react';
import { FlatList, RefreshControl, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Wrench, Calendar, Clock, AlertTriangle, Package } from 'lucide-react-native';
import { AvailableAssetsResponse } from '@/lib/tech.types';

type MaintenanceAsset = {
  _id: string;
  assetTag: string;
  name: string;
  category: string;
  brand?: string;
  lastMaintenance?: number;
  nextMaintenance?: number;
  condition: string;
  status: string;
  maintenanceInterval?: number;
};

export default function TechAssetMaintenanceScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch all assets for maintenance tracking
  const assetsData: AvailableAssetsResponse | undefined = useQuery(api.tech.getAvailableAssets, {});

  // Mutations
  const scheduleMaintenance = useMutation(api.tech.scheduleAssetMaintenance);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const assets: MaintenanceAsset[] = React.useMemo(() => {
    if (!assetsData?.success) return [];

    return assetsData.data.map(asset => ({
      _id: asset._id,
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      brand: asset.brand,
      lastMaintenance: asset.maintenanceSchedule?.lastMaintenance,
      nextMaintenance: asset.maintenanceSchedule?.nextMaintenance,
      condition: asset.condition,
      status: 'available', // This would come from the asset status
      maintenanceInterval: asset.maintenanceSchedule?.interval,
    }));
  }, [assetsData]);

  // Separate assets into categories
  const overdueAssets = assets.filter(asset => asset.nextMaintenance && asset.nextMaintenance < Date.now());

  const dueSoonAssets = assets.filter(
    asset =>
      asset.nextMaintenance &&
      asset.nextMaintenance >= Date.now() &&
      asset.nextMaintenance <= Date.now() + 7 * 24 * 60 * 60 * 1000 // Next 7 days
  );

  const upcomingAssets = assets.filter(
    asset =>
      asset.nextMaintenance &&
      asset.nextMaintenance > Date.now() + 7 * 24 * 60 * 60 * 1000 &&
      asset.nextMaintenance <= Date.now() + 30 * 24 * 60 * 60 * 1000 // Next 30 days
  );

  const noScheduleAssets = assets.filter(asset => !asset.maintenanceSchedule);

  const handleScheduleMaintenance = async (assetId: string, assetName: string) => {
    Alert.alert('Schedule Maintenance', `Schedule maintenance for ${assetName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Schedule',
        onPress: async () => {
          try {
            const scheduledDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
            await scheduleMaintenance({
              assetId: assetId as any,
              maintenanceType: 'Routine',
              description: 'Scheduled routine maintenance',
              scheduledDate,
            });
            Alert.alert('Success', 'Maintenance scheduled successfully');
          } catch {
            Alert.alert('Error', 'Failed to schedule maintenance');
          }
        },
      },
    ]);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'fair':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'poor':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'broken':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilMaintenance = (nextMaintenance?: number) => {
    if (!nextMaintenance) return null;
    const days = Math.ceil((nextMaintenance - Date.now()) / (24 * 60 * 60 * 1000));
    return days;
  };

  const renderAsset = ({ item }: { item: MaintenanceAsset }) => {
    const daysUntil = getDaysUntilMaintenance(item.nextMaintenance);
    const isOverdue = daysUntil !== null && daysUntil < 0;
    const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

    return (
      <View className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-3'>
        <View className='flex-row justify-between items-start mb-3'>
          <View className='flex-1'>
            <View className='flex-row items-center gap-2 mb-2'>
              <Text className='text-lg font-semibold'>{item.name}</Text>
              <View
                className={`px-2 py-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 ${getConditionColor(item.condition)}`}
              >
                <Text className='text-xs font-medium capitalize'>{item.condition}</Text>
              </View>
            </View>
            <Text className='text-sm text-muted-foreground mb-2'>Tag: {item.assetTag}</Text>
            <Text className='text-sm text-muted-foreground capitalize'>{item.category.replace('_', ' ')}</Text>
          </View>
          <View className='items-end gap-2'>
            {isOverdue && (
              <View className='flex-row items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full'>
                <Icon as={AlertTriangle} size={12} className='text-red-600' />
                <Text className='text-xs font-medium text-red-600'>OVERDUE</Text>
              </View>
            )}
            {isDueSoon && !isOverdue && (
              <View className='flex-row items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full'>
                <Icon as={Clock} size={12} className='text-yellow-600' />
                <Text className='text-xs font-medium text-yellow-600'>{daysUntil}d</Text>
              </View>
            )}
          </View>
        </View>

        <View className='space-y-2 mb-3'>
          <View className='flex-row justify-between'>
            <Text className='text-sm text-muted-foreground'>Last Maintenance:</Text>
            <Text className='text-sm'>{formatDate(item.lastMaintenance)}</Text>
          </View>
          <View className='flex-row justify-between'>
            <Text className='text-sm text-muted-foreground'>Next Maintenance:</Text>
            <Text className='text-sm'>{formatDate(item.nextMaintenance)}</Text>
          </View>
        </View>

        <View className='flex-row gap-2'>
          <Button
            onPress={() => handleScheduleMaintenance(item._id, item.name)}
            variant='outline'
            size='sm'
            className='flex-1'
          >
            <Icon as={Calendar} size={14} />
            <Text className='text-sm'>Schedule</Text>
          </Button>
        </View>
      </View>
    );
  };

  const renderSection = (title: string, data: MaintenanceAsset[], icon: any, color: string, emptyMessage: string) => (
    <View className='mb-6'>
      <View className='flex-row items-center gap-2 mb-4'>
        <View className={`w-8 h-8 rounded-lg ${color} items-center justify-center`}>
          <Icon as={icon} size={16} className='text-white' />
        </View>
        <Text className='text-lg font-semibold'>
          {title} ({data.length})
        </Text>
      </View>

      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderAsset}
          keyExtractor={item => item._id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className='bg-card p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 items-center'>
          <Icon as={Package} size={32} className='text-muted-foreground mb-2' />
          <Text className='text-sm text-muted-foreground text-center'>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      {/* Header */}
      <View className='pt-16 px-5 pb-5 bg-orange-800 rounded-b-[20px]'>
        <View className='flex-row items-center gap-4 mb-4'>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className='text-white' />
          </TouchableOpacity>
          <View className='flex-1'>
            <Text className='text-xl font-bold text-white'>Asset Maintenance</Text>
            <Text className='text-sm text-white/80'>Track and schedule equipment maintenance</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className='flex-1'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className='p-5'>
          {renderSection(
            'Overdue Maintenance',
            overdueAssets,
            AlertTriangle,
            'bg-red-600',
            'No overdue maintenance items'
          )}

          {renderSection(
            'Due Soon (Next 7 days)',
            dueSoonAssets,
            Clock,
            'bg-yellow-600',
            'No maintenance due in the next 7 days'
          )}

          {renderSection(
            'Upcoming (Next 30 days)',
            upcomingAssets,
            Calendar,
            'bg-blue-600',
            'No maintenance scheduled in the next 30 days'
          )}

          {renderSection(
            'No Maintenance Schedule',
            noScheduleAssets,
            Wrench,
            'bg-gray-600',
            'All assets have maintenance schedules'
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
