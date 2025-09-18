import React from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, QrCode, Search, Package, CheckCircle, AlertTriangle, ScanLine } from 'lucide-react-native';
import { AvailableAsset, AvailableAssetsResponse } from '@/lib/tech.types';

export default function TechAssetCheckoutScreen() {
  const [assetTag, setAssetTag] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [selectedAsset, setSelectedAsset] = React.useState<AvailableAsset | null>(null);

  // Fetch available assets
  const assetsData: AvailableAssetsResponse | undefined = useQuery(api.tech.getAvailableAssets, {});

  // Mutations
  const checkoutAsset = useMutation(api.tech.checkoutAsset);

  const assets: AvailableAsset[] = assetsData?.success ? assetsData.data || [] : [];

  const handleScanQR = () => {
    // TODO: Implement QR/barcode scanning functionality
    Alert.alert('Coming Soon', 'QR/Barcode scanning will be implemented');
  };

  const handleSearchAsset = () => {
    if (!assetTag.trim()) {
      Alert.alert('Error', 'Please enter an asset tag');
      return;
    }

    const asset = assets.find(a => a.assetTag.toLowerCase() === assetTag.toLowerCase());
    if (asset) {
      setSelectedAsset(asset);
    } else {
      Alert.alert('Not Found', 'Asset not found or not available');
      setSelectedAsset(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAsset) return;

    try {
      await checkoutAsset({
        assetId: selectedAsset._id,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', `${selectedAsset.name} checked out successfully`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to checkout asset');
    }
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

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      {/* Header */}
      <View className='pt-16 px-5 pb-5 bg-purple-800 rounded-b-[20px]'>
        <View className='flex-row items-center gap-4 mb-4'>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className='text-white' />
          </TouchableOpacity>
          <View className='flex-1'>
            <Text className='text-xl font-bold text-white'>Asset Checkout</Text>
            <Text className='text-sm text-white/80'>Scan or search for assets</Text>
          </View>
        </View>
      </View>

      <View className='flex-1 px-5'>
        {/* Scan QR Button */}
        <TouchableOpacity
          onPress={handleScanQR}
          className='bg-purple-50 dark:bg-purple-950/20 p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 items-center mb-6'
        >
          <View className='w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mb-4'>
            <Icon as={QrCode} size={32} className='text-purple-600' />
          </View>
          <Text className='text-lg font-semibold text-purple-600 mb-2'>Scan QR Code</Text>
          <Text className='text-sm text-purple-600/80 text-center'>Use camera to scan asset QR code</Text>
        </TouchableOpacity>

        {/* Manual Search */}
        <View className='mb-6'>
          <Text className='text-lg font-semibold mb-4'>Or Search Manually</Text>

          <View className='flex-row gap-2 mb-4'>
            <View className='flex-1 relative'>
              <Icon
                as={ScanLine}
                size={20}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
              />
              <TextInput
                className='w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl'
                placeholder='Enter asset tag...'
                value={assetTag}
                onChangeText={setAssetTag}
                autoCapitalize='characters'
              />
            </View>
            <Button onPress={handleSearchAsset} variant='outline' size='sm'>
              <Icon as={Search} size={16} />
            </Button>
          </View>
        </View>

        {/* Selected Asset Details */}
        {selectedAsset && (
          <View className='bg-card p-4 rounded-xl border border-border mb-6'>
            <View className='flex-row items-center gap-3 mb-3'>
              <View className='w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg items-center justify-center'>
                <Icon as={Package} size={24} className='text-purple-600' />
              </View>
              <View className='flex-1'>
                <Text className='text-lg font-semibold'>{selectedAsset.name}</Text>
                <Text className='text-sm text-muted-foreground'>Tag: {selectedAsset.assetTag}</Text>
              </View>
              <View className={`px-2 py-1 rounded-full ${getConditionColor(selectedAsset.condition)}`}>
                <Text className='text-xs font-medium capitalize'>{selectedAsset.condition}</Text>
              </View>
            </View>

            <View className='space-y-2 mb-4'>
              <View className='flex-row justify-between'>
                <Text className='text-sm text-muted-foreground'>Category:</Text>
                <Text className='text-sm capitalize'>{selectedAsset.category.replace('_', ' ')}</Text>
              </View>
              {selectedAsset.brand && (
                <View className='flex-row justify-between'>
                  <Text className='text-sm text-muted-foreground'>Brand:</Text>
                  <Text className='text-sm'>{selectedAsset.brand}</Text>
                </View>
              )}
              <View className='flex-row justify-between'>
                <Text className='text-sm text-muted-foreground'>Location:</Text>
                <Text className='text-sm'>{selectedAsset.location}</Text>
              </View>
            </View>

            {/* Notes */}
            <View className='mb-4'>
              <Text className='text-sm font-medium mb-2'>Notes (Optional)</Text>
              <TextInput
                className='w-full h-20 p-3 bg-background border border-border rounded-xl text-sm'
                placeholder='Add checkout notes...'
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical='top'
              />
            </View>

            {/* Checkout Button */}
            <Button onPress={handleCheckout} variant='default' className='w-full gap-2' size='lg'>
              <Icon as={CheckCircle} size={20} />
              <Text className='text-white font-semibold'>Checkout Asset</Text>
            </Button>
          </View>
        )}

        {/* Instructions */}
        {!selectedAsset && (
          <View className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800'>
            <View className='flex-row items-start gap-3'>
              <Icon as={AlertTriangle} size={20} className='text-blue-600 mt-0.5' />
              <View className='flex-1'>
                <Text className='text-sm font-medium text-blue-600 mb-1'>How to Checkout</Text>
                <Text className='text-sm text-blue-600/80'>
                  Scan the QR code on the asset or manually enter the asset tag. Review the details and add any notes
                  before checking out.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}
