import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { usePropertyStore } from '@/stores/user.store';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/TextField';
import { Icon } from '@/components/ui/icon';
import { Dropdown } from '@/components/ui/dropdown';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, AlertTriangle, Building2, Plus, Home, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function NewMaintenanceRequest() {
  const create = useMutation(api.maintenance.createRequest);
  const { selectedPropertyId, selectedUnit } = usePropertyStore();

  // Fetch property details (only needed if no unit is selected)
  const myProperties = useQuery(api.property.getMyProperties);
  const currentUser = useQuery(api.user.getCurrentUser);

  // Find the selected property - either from the selected unit's property or from the property list
  const selectedProperty =
    selectedUnit?.property ||
    (myProperties?.success && myProperties.properties
      ? myProperties.properties.find(p => p._id === selectedPropertyId)
      : null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [requestType, setRequestType] = useState<
    'general' | 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'emergency'
  >('general');

  const onSubmit = async () => {
    try {
      if (!selectedPropertyId) {
        Alert.alert('Property is required', 'Please select a property first');
        return;
      }

      if (!currentUser?.success || !currentUser.user) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }

      await create({
        propertyId: selectedPropertyId as Id<'properties'>,
        unitId: selectedUnit ? (selectedUnit._id as Id<'units'>) : undefined,
        requestType,
        priority,
        title,
        description,
        location,
        requestedBy: currentUser.user._id as Id<'users'>,
      });
      router.back();
    } catch (e) {
      // TODO: surface error
      console.warn(e);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-slate-50'>
      {/* Header */}
      <View className='pt-16 px-5 pb-5 bg-blue-800 rounded-b-[20px]'>
        <View className='flex-row justify-between items-center'>
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-xl bg-white/20 items-center justify-center'>
              <Icon as={Plus} size={28} className='text-white' />
            </View>
            <View>
              <Text className='text-3xl font-bold text-white tracking-tight'>New Request</Text>
              <Text className='text-sm text-white/80 mt-0.5'>Submit a maintenance request</Text>
            </View>
          </View>

          <Button className='bg-white rounded-xl px-4 py-3' onPress={() => router.back()}>
            <View className='flex-row items-center gap-2'>
              <Icon as={ArrowLeft} size={18} className='text-blue-800' />
              <Text className='text-blue-800 text-sm font-semibold'>Back</Text>
            </View>
          </Button>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        className='gap-4'
      >
        {/* Form Card */}
        <View className='bg-white rounded-2xl p-5 border border-gray-100'>
          <View className='items-center mb-6'>
            <View className='w-16 h-16 rounded-[32px] bg-cyan-50 items-center justify-center mb-4'>
              <Icon as={FileText} size={32} className='text-blue-600' />
            </View>
            <Text className='text-xl font-bold text-gray-900 text-center mb-2'>Create Maintenance Request</Text>
            <Text className='text-gray-500 text-center'>Please provide details about the issue</Text>
          </View>

          {/* Property Information */}
          <View>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={Building2} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Selected Property</Text>
            </View>
            <View className='bg-gray-50 rounded-xl p-4 gap-3'>
              {selectedProperty ? (
                <>
                  <View className='flex-row items-center gap-2'>
                    <Icon as={Building2} size={18} className='text-blue-600' />
                    <Text className='text-lg font-semibold text-gray-900'>{selectedProperty.name}</Text>
                  </View>
                  <View className='gap-1'>
                    <Text className='text-sm text-gray-600'>
                      {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}{' '}
                      {selectedProperty.zipCode}
                    </Text>
                    <Text className='text-sm text-gray-500 capitalize'>{selectedProperty.propertyType}</Text>
                  </View>
                  {selectedUnit && (
                    <View className='mt-2 pt-3 border-t border-gray-200'>
                      <View className='flex-row items-center gap-2'>
                        <Icon as={Home} size={16} className='text-blue-600' />
                        <Text className='text-base font-medium text-gray-900'>Unit {selectedUnit.unitNumber}</Text>
                      </View>
                      {selectedUnit.floor && <Text className='text-sm text-gray-600'>Floor {selectedUnit.floor}</Text>}
                    </View>
                  )}
                </>
              ) : (
                <View className='items-center py-4'>
                  <Text className='text-gray-500 text-center'>No property selected</Text>
                  <Text className='text-gray-400 text-sm text-center mt-1 mb-4'>
                    Please select a property from the properties screen first
                  </Text>
                  <Button
                    onPress={() => router.push('/(tabs)/properties')}
                    className='bg-blue-800 rounded-lg px-4 py-2'
                  >
                    <View className='flex-row items-center gap-2'>
                      <Icon as={Building2} size={16} className='text-white' />
                      <Text className='text-white text-sm font-semibold'>Go to Properties</Text>
                      <Icon as={ArrowRight} size={14} className='text-white' />
                    </View>
                  </Button>
                </View>
              )}
            </View>
          </View>

          <Separator className='my-6' />

          {/* Request Details */}
          <View>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={FileText} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Request Details</Text>
            </View>
            <View className='gap-3'>
              <TextField
                label='Title'
                value={title}
                onChangeText={setTitle}
                placeholder='Brief description of the issue'
              />
              <TextField
                label='Description'
                value={description}
                onChangeText={setDescription}
                placeholder='Provide detailed information about the issue'
                multiline
                style={{ minHeight: 100 }}
              />
              <TextField
                label='Location'
                value={location}
                onChangeText={setLocation}
                placeholder='e.g., Kitchen sink, Living room, Bathroom'
              />
            </View>
          </View>

          <Separator className='my-6' />

          {/* Priority & Type */}
          <View>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={AlertTriangle} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Classification</Text>
            </View>
            <View className='gap-3'>
              <View>
                <Text className='text-sm font-semibold text-gray-900 mb-2'>Priority Level</Text>
                <Dropdown
                  value={priority}
                  onValueChange={(value: string) => {
                    console.log('Priority changed to:', value);
                    setPriority(value as 'low' | 'medium' | 'high' | 'emergency');
                  }}
                  placeholder='Select priority level'
                  data={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Emergency', value: 'emergency' },
                  ]}
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-900 mb-2'>Request Type</Text>
                <Dropdown
                  value={requestType}
                  onValueChange={(value: string) => {
                    console.log('Request type changed to:', value);
                    setRequestType(value as 'general' | 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'emergency');
                  }}
                  placeholder='Select request type'
                  data={[
                    { label: 'General', value: 'general' },
                    { label: 'Plumbing', value: 'plumbing' },
                    { label: 'Electrical', value: 'electrical' },
                    { label: 'HVAC', value: 'hvac' },
                    { label: 'Appliance', value: 'appliance' },
                    { label: 'Emergency', value: 'emergency' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View className='gap-3'>
          <Button
            onPress={onSubmit}
            disabled={!selectedPropertyId || !currentUser?.success || !currentUser.user}
            className={`rounded-xl py-0 ${
              selectedPropertyId && currentUser?.success && currentUser.user ? 'bg-blue-800' : 'bg-gray-400'
            }`}
          >
            <View className='flex-row items-center gap-2'>
              <Icon as={FileText} size={18} className='text-white' />
              <Text className='text-white font-semibold'>
                {!selectedPropertyId
                  ? 'Select Unit/Property First'
                  : !currentUser?.success || !currentUser.user
                    ? 'Loading...'
                    : 'Submit Request'}
              </Text>
            </View>
          </Button>
          <Text className='text-gray-500 text-center text-sm'>
            Your request will be reviewed and assigned to a technician
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
