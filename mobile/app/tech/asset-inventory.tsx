import React from 'react';
import { FlatList, RefreshControl, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Package, Search, QrCode, CheckCircle, Clock, Wrench, ScanLine } from 'lucide-react-native';
import { AvailableAsset, AvailableAssetsResponse } from '@/lib/tech.types';
import { Id } from '@convex/_generated/dataModel';
import QRScanner from '@/components/tech/qr-scanner';
import { PageHeader } from '@/components/ui/page-header';

export default function TechAssetInventoryScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  // Fetch available assets
  const assetsData: AvailableAssetsResponse | undefined = useQuery(api.tech.getAvailableAssets, {
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const checkoutAsset = useMutation(api.tech.checkoutAsset);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const assets: AvailableAsset[] = React.useMemo(() => {
    return assetsData?.success ? assetsData.data || [] : [];
  }, [assetsData]);

  const categories = React.useMemo(() => {
    const cats = new Set(assets.map(asset => asset.category));
    return Array.from(cats);
  }, [assets]);

  const handleCheckout = async (assetId: string, assetName: string) => {
    Alert.alert('Checkout Asset', `Are you sure you want to check out ${assetName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Checkout',
        onPress: async () => {
          try {
            await checkoutAsset({ assetId: assetId as Id<'assets'> });
            Alert.alert('Success', `${assetName} checked out successfully`);
          } catch {
            Alert.alert('Error', 'Failed to checkout asset');
          }
        },
      },
    ]);
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = (scannedData: string) => {
    setSearchQuery(scannedData);
    setShowScanner(false);
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

  const renderAsset = ({ item }: { item: any }) => (
    <View className='mx-5 mb-4 p-4 bg-card rounded-xl border border-gray-200/50 dark:border-gray-700/50'>
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
        </View>
        <View className='flex-row gap-2'>
          <TouchableOpacity onPress={() => handleScanQR()} className='p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
            <Icon as={ScanLine} size={16} className='text-blue-600' />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCheckout(item._id, item.name)}
            className='p-2 bg-green-50 dark:bg-green-950/20 rounded-lg'
          >
            <Icon as={CheckCircle} size={16} className='text-green-600' />
          </TouchableOpacity>
        </View>
      </View>

      <View className='flex-row items-center justify-between mb-3'>
        <View className='flex-row items-center gap-2'>
          <Icon as={Package} size={14} className='text-muted-foreground' />
          <Text className='text-sm text-muted-foreground capitalize'>{item.category.replace('_', ' ')}</Text>
        </View>
        {item.subcategory && <Text className='text-sm text-muted-foreground'>{item.subcategory}</Text>}
      </View>

      {item.brand && item.model && (
        <View className='flex-row items-center gap-2 mb-3'>
          <Icon as={Wrench} size={14} className='text-muted-foreground' />
          <Text className='text-sm text-muted-foreground'>
            {item.brand} {item.model}
          </Text>
        </View>
      )}

      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center gap-2'>
          <Icon as={Clock} size={14} className='text-muted-foreground' />
          <Text className='text-sm text-muted-foreground'>{item.location}</Text>
        </View>
        {item.maintenanceSchedule?.nextMaintenance && (
          <Text className='text-xs text-muted-foreground'>
            Next maint: {new Date(item.maintenanceSchedule.nextMaintenance).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader
        title='Asset Inventory'
        subtitle='Available tools and equipment'
        type='back'
        rightSlot={
          <TouchableOpacity onPress={handleScanQR}>
            <View className='p-2 bg-white/20 rounded-lg'>
              <Icon as={QrCode} size={24} className='text-white' />
            </View>
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View className='px-5 pb-5 pt-4'>
        <View className='relative'>
          <Icon as={Search} size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-800/60' />
          <TextInput
            className='w-full h-12 pl-12 pr-4 bg-white rounded-xl placeholder:text-blue-800/60 text-black'
            placeholder='Search assets...'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filters */}
      <View className='px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50'>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-2'>
          <Button
            onPress={() => setCategoryFilter(null)}
            variant={!categoryFilter ? 'default' : 'outline'}
            size='sm'
            className='rounded-full'
          >
            <Text className='text-sm font-medium'>All Categories</Text>
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              onPress={() => setCategoryFilter(category)}
              variant={categoryFilter === category ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
            >
              <Text className='text-sm font-medium capitalize'>{category.replace('_', ' ')}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Asset List */}
      <FlatList
        data={assets}
        renderItem={renderAsset}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center py-12'>
            <Icon as={Package} size={48} className='text-muted-foreground mb-4' />
            <Text className='text-lg font-medium text-muted-foreground mb-2'>No assets found</Text>
            <Text className='text-sm text-muted-foreground text-center px-8'>
              {searchQuery ? 'Try adjusting your search or filters' : 'No available assets in your properties'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      />

      {/* QR Scanner Modal */}
      {showScanner && (
        <View className='absolute inset-0 z-50'>
          <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} title='Scan Asset QR Code' />
        </View>
      )}
    </ThemedView>
  );
}
