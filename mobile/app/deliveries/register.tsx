import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { usePropertyStore } from '@/stores/user.store';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/TextField';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { Dropdown } from '@/components/ui/dropdown';
import { Package, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';

export default function RegisterDelivery() {
  const registerDelivery = useAction(api.delivery.registerDelivery);
  const { selectedPropertyId, selectedUnit } = usePropertyStore();
  const myProperties = useQuery(api.property.getMyProperties);

  const selectedProperty =
    selectedUnit?.property ||
    (myProperties?.success && myProperties.properties && Array.isArray(myProperties.properties)
      ? myProperties.properties.find(p => p._id === selectedPropertyId)
      : null);

  const [deliveryType, setDeliveryType] = useState<'package' | 'food' | 'grocery' | 'mail' | 'other'>('package');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (
      !senderName.trim() ||
      !recipientName.trim() ||
      !description.trim() ||
      !estimatedDate.trim() ||
      !estimatedTime.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!selectedPropertyId) {
      Alert.alert('Error', 'Please select a property first');
      return;
    }

    setIsSubmitting(true);

    try {
      const estimatedDelivery = new Date(`${estimatedDate}T${estimatedTime}`).getTime();

      const result = await registerDelivery({
        propertyId: selectedPropertyId as Id<'properties'>,
        unitId: selectedUnit?._id as Id<'units'>,
        deliveryType,
        senderName: senderName.trim(),
        recipientName: recipientName.trim(),
        description: description.trim(),
        estimatedDelivery,
      });

      if (result.success) {
        Alert.alert('Success', 'Delivery registered successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Error', result.message || 'Failed to register delivery');
      }
    } catch {
      Alert.alert('Error', 'Failed to register delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-slate-50'>
      <PageHeader title='Register Delivery' subtitle='Register an expected delivery' type='back' />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        <View className='bg-white rounded-2xl p-5 border border-gray-100 mb-4'>
          <View className='items-center mb-6'>
            <View className='w-16 h-16 rounded-[32px] bg-blue-50 items-center justify-center mb-4'>
              <Icon as={Package} size={32} className='text-blue-600' />
            </View>
            <Text className='text-xl font-bold text-gray-900 text-center mb-2'>Register Expected Delivery</Text>
            <Text className='text-gray-500 text-center'>Help us track your incoming package</Text>
          </View>

          {/* Property Info */}
          <View className='mb-6'>
            <View className='flex-row items-center gap-2 mb-3'>
              <Icon as={Building2} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Delivery Location</Text>
            </View>
            <View className='bg-gray-50 rounded-xl p-4'>
              {selectedProperty ? (
                <>
                  <Text className='text-lg font-semibold text-gray-900'>{selectedProperty.name}</Text>
                  <Text className='text-sm text-gray-600 mt-1'>{selectedProperty.address}</Text>
                  {selectedUnit && (
                    <View className='mt-2 pt-2 border-t border-gray-200'>
                      <Text className='text-base font-medium text-gray-900'>Unit {selectedUnit.unitNumber}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text className='text-gray-500 text-center'>No property selected</Text>
              )}
            </View>
          </View>

          {/* Delivery Type */}
          <View className='mb-4'>
            <Text className='text-sm font-semibold text-gray-900 mb-2'>Delivery Type</Text>
            <Dropdown
              value={deliveryType}
              onValueChange={(value: string) => setDeliveryType(value as any)}
              placeholder='Select delivery type'
              data={[
                { label: '📦 Package', value: 'package' },
                { label: '🍔 Food', value: 'food' },
                { label: '🛒 Grocery', value: 'grocery' },
                { label: '📧 Mail', value: 'mail' },
                { label: '📋 Other', value: 'other' },
              ]}
            />
          </View>

          {/* Form Fields */}
          <View className='gap-4'>
            <TextField
              label='Sender Name *'
              value={senderName}
              onChangeText={setSenderName}
              placeholder='e.g., Amazon, UPS, John Smith'
            />

            <TextField
              label='Recipient Name *'
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder='Full name of person receiving delivery'
            />

            <TextField
              label='Package Description *'
              value={description}
              onChangeText={setDescription}
              placeholder='Describe the package contents'
              multiline
              style={{ minHeight: 80 }}
            />

            <TextField
              label='Expected Date *'
              value={estimatedDate}
              onChangeText={setEstimatedDate}
              placeholder='YYYY-MM-DD (e.g., 2024-03-15)'
            />

            <TextField
              label='Expected Time *'
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              placeholder='HH:MM (e.g., 14:30)'
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className='gap-3 pb-6'>
          <Button
            onPress={onSubmit}
            disabled={!selectedPropertyId || isSubmitting}
            className={`rounded-xl ${selectedPropertyId && !isSubmitting ? 'bg-blue-800' : 'bg-gray-400'}`}
          >
            <View className='flex-row items-center gap-2'>
              <Icon as={Package} size={18} className='text-white' />
              <Text className='text-white font-semibold text-base h-full'>
                {isSubmitting ? 'Registering...' : 'Register Delivery'}
              </Text>
            </View>
          </Button>
          <Text className='text-gray-500 text-center text-sm'>
            You&apos;ll receive notifications when your delivery status changes
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
