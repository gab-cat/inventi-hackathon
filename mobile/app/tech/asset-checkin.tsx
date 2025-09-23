import React from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { QrCode, Search, Package, CheckCircle, AlertTriangle, ScanLine, MapPin } from 'lucide-react-native';
import { CheckedOutAsset, CheckedOutAssetsResponse, AssetCondition } from '@/lib/tech.types';
import QRScanner from '@/components/tech/qr-scanner';
import { Id } from '@convex/_generated/dataModel';
import { PageHeader } from '@/components/ui/page-header';

export default function TechAssetCheckinScreen() {
  const [assetTag, setAssetTag] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [selectedAsset, setSelectedAsset] = React.useState<CheckedOutAsset | null>(null);
  const [showScanner, setShowScanner] = React.useState(false);
  const [condition, setCondition] = React.useState<AssetCondition>('good');

  // Fetch checked out assets
  const assetsData: CheckedOutAssetsResponse | undefined = useQuery(api.tech.getCheckedOutAssets, {});

  // Mutations
  const checkinAsset = useMutation(api.tech.checkinAsset);

  const assets: CheckedOutAsset[] = assetsData?.success ? assetsData.data || [] : [];

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = (scannedData: string) => {
    setAssetTag(scannedData);
    setShowScanner(false);
    // Auto-search for the asset
    handleSearchAsset(scannedData);
  };

  const handleSearchAsset = (tag?: string) => {
    const searchTag = tag || assetTag;
    if (!searchTag.trim()) {
      Alert.alert('Error', 'Please enter an asset tag');
      return;
    }

    const asset = assets.find(a => a.assetTag.toLowerCase() === searchTag.toLowerCase());
    if (asset) {
      setSelectedAsset(asset);
    } else {
      Alert.alert('Not Found', 'Asset not found or not checked out to you');
      setSelectedAsset(null);
    }
  };

  const handleCheckin = async () => {
    if (!selectedAsset) return;

    try {
      await checkinAsset({
        assetId: selectedAsset._id as Id<'assets'>,
        condition: condition,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', `${selectedAsset.name} checked in successfully`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to check in asset');
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

  const formatDate = (dateInput: string | number) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const conditionOptions: { value: AssetCondition; label: string; description: string }[] = [
    { value: 'excellent', label: 'Excellent', description: 'Like new, no visible wear' },
    { value: 'good', label: 'Good', description: 'Minor wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear, still functional' },
    { value: 'poor', label: 'Poor', description: 'Significant wear, may need attention' },
    { value: 'broken', label: 'Broken', description: 'Not functional, needs repair' },
  ];

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader title='Asset Check-in' subtitle='Return equipment to inventory' type='back' />

      <View className='px-5 pt-6 pb-4'>
        {/* Search */}
        <View className='relative mb-4'>
          <Icon as={Search} size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60' />
          <TextInput
            className='w-full h-12 pl-12 pr-20 bg-white/10 rounded-xl placeholder:text-white/60'
            placeholder='Enter asset tag...'
            value={assetTag}
            onChangeText={setAssetTag}
            onSubmitEditing={() => handleSearchAsset()}
          />
          <TouchableOpacity
            onPress={handleScanQR}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 rounded-lg'
          >
            <Icon as={QrCode} size={20} className='text-white' />
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <Button onPress={() => handleSearchAsset()} variant='secondary' className='w-full gap-2'>
          <Icon as={Search} size={18} />
          <Text className='font-semibold'>Search Asset</Text>
        </Button>
      </View>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Selected Asset Details */}
        {selectedAsset && (
          <View className='mb-6'>
            <View className='bg-white rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm'>
              <View className='flex-row items-center justify-between mb-4'>
                <View className='flex-1'>
                  <View className='flex-row items-center gap-2 mb-2'>
                    <Icon as={Package} size={20} className='text-green-600' />
                    <Text className='text-lg font-semibold'>{selectedAsset.name}</Text>
                  </View>
                  <Text className='text-sm text-muted-foreground'>Tag: {selectedAsset.assetTag}</Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 ${getConditionColor(selectedAsset.condition)}`}
                >
                  <Text className='text-xs font-medium capitalize'>{selectedAsset.condition}</Text>
                </View>
              </View>

              <View className='space-y-3 mb-4'>
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
                  <Text className='text-sm text-muted-foreground'>Checked out:</Text>
                  <Text className='text-sm'>
                    {selectedAsset.checkedOutAt ? formatDate(selectedAsset.checkedOutAt) : 'Unknown'}
                  </Text>
                </View>
                <View className='flex-row items-center justify-between'>
                  <Text className='text-sm text-muted-foreground'>From:</Text>
                  <View className='flex-row items-center gap-1'>
                    <Icon as={MapPin} size={14} className='text-muted-foreground' />
                    <Text className='text-sm'>{selectedAsset.checkedOutLocation}</Text>
                  </View>
                </View>
              </View>

              {/* Condition Selection */}
              <View className='mb-4'>
                <Text className='text-sm font-medium mb-3'>Current Condition *</Text>
                <View className='space-y-2'>
                  {conditionOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setCondition(option.value)}
                      className={`p-3 border rounded-xl ${
                        condition === option.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : 'border-border bg-card'
                      }`}
                    >
                      <View className='flex-row items-center gap-3'>
                        <View
                          className={`w-4 h-4 rounded-full border-2 ${
                            condition === option.value ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}
                        >
                          {condition === option.value && (
                            <View className='w-full h-full rounded-full bg-white scale-50' />
                          )}
                        </View>
                        <View className='flex-1'>
                          <Text className='font-medium'>{option.label}</Text>
                          <Text className='text-xs text-muted-foreground'>{option.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View className='mb-4'>
                <Text className='text-sm font-medium mb-2'>Check-in Notes (Optional)</Text>
                <TextInput
                  className='w-full h-20 p-3 bg-background border border-border rounded-xl text-sm'
                  placeholder='Add check-in notes (condition, issues, etc.)...'
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical='top'
                />
              </View>

              {/* Check-in Button */}
              <Button
                onPress={handleCheckin}
                variant='default'
                className='w-full gap-2 bg-green-600 hover:bg-green-700'
                size='lg'
              >
                <Icon as={CheckCircle} size={20} />
                <Text className='text-white font-semibold'>Check-in Asset</Text>
              </Button>
            </View>
          </View>
        )}

        {/* Checked Out Assets List */}
        {!selectedAsset && (
          <View className='pt-6'>
            <Text className='text-lg font-semibold mb-4'>Your Checked Out Assets</Text>
            {assets.length > 0 ? (
              <View className='space-y-3'>
                {assets.map(asset => (
                  <TouchableOpacity
                    key={asset._id}
                    onPress={() => setSelectedAsset(asset)}
                    className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50'
                  >
                    <View className='flex-row items-center justify-between'>
                      <View className='flex-1'>
                        <View className='flex-row items-center gap-2 mb-1'>
                          <Icon as={Package} size={18} className='text-blue-600' />
                          <Text className='font-medium'>{asset.name}</Text>
                        </View>
                        <Text className='text-sm text-muted-foreground'>Tag: {asset.assetTag}</Text>
                        <Text className='text-xs text-muted-foreground mt-1'>
                          Checked out {asset.checkedOutAt ? formatDate(asset.checkedOutAt) : 'Unknown'}
                        </Text>
                      </View>
                      <View className='items-end gap-2'>
                        <View className={`px-2 py-1 rounded-full ${getConditionColor(asset.condition)}`}>
                          <Text className='text-xs font-medium capitalize'>{asset.condition}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedAsset(asset)}
                          className='p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg'
                        >
                          <Icon as={ScanLine} size={16} className='text-blue-600' />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className='items-center justify-center py-12'>
                <Icon as={Package} size={48} className='text-muted-foreground mb-4' />
                <Text className='text-lg font-medium text-muted-foreground mb-2'>No checked out assets</Text>
                <Text className='text-sm text-muted-foreground text-center px-8'>
                  You don&apos;t have any assets checked out. Assets you check out will appear here for easy return.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Instructions */}
        {!selectedAsset && (
          <View className='pb-8'>
            <View className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800'>
              <View className='flex-row items-start gap-3'>
                <Icon as={AlertTriangle} size={20} className='text-blue-600 mt-0.5' />
                <View className='flex-1'>
                  <Text className='text-sm font-medium text-blue-600 mb-1'>How to Check-in</Text>
                  <Text className='text-sm text-blue-600/80'>
                    Scan the QR code on the asset or select from your checked out assets list. Review the condition and
                    add any notes before checking in.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <View className='absolute inset-0 z-50'>
            <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} title='Scan Asset QR Code' />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
