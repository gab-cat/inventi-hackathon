import React from 'react';
import { ScrollView, View, Alert, Image } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';

import { CostTrackerModal } from '@/components/tech/cost-tracker-modal';
import { AddUpdateModal } from '@/components/tech/add-update-modal';
import { compressImage } from '../../lib/image-utils';
import {
  Wrench,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  DollarSign,
  MessageSquare,
  Phone,
  Mail,
  Building,
} from 'lucide-react-native';
import { RequestDetailsResponse, RequestDetailsData, UpdateableMaintenanceRequestStatus } from '@/lib/tech.types';
import { Id } from '@convex/_generated/dataModel';
import { PhotoPicker } from '@/components/tech/photo-picker';
import { formatDate } from '@/lib/utils';

export default function TechRequestDetailsScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [showCostModal, setShowCostModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);

  // Fetch request details
  const requestData: RequestDetailsResponse | undefined = useQuery(api.tech.getRequestDetails, {
    requestId: requestId as Id<'maintenanceRequests'>,
  });

  // Mutations
  const updateStatus = useMutation(api.tech.updateRequestStatus);
  const addPhoto = useMutation(api.tech.addMaintenancePhoto);
  const generateUploadUrl = useMutation(api.tech.generateUploadUrl);
  const saveUploadedPhoto = useMutation(api.tech.saveUploadedPhoto);
  const updateCost = useMutation(api.tech.updateMaintenanceCost);
  const requestApproval = useMutation(api.tech.requestTenantApproval);

  const requestDetails: RequestDetailsData | null = requestData?.success ? requestData.data || null : null;
  const request = requestDetails?.request;
  const updates = requestDetails?.updates || [];

  // Upload image to Convex storage with compression
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Step 1: Compress the image
      console.log('Compressing image:', uri);
      const compressedBlob = await compressImage(
        { uri },
        {
          width: 1200, // Max width
          height: 1200, // Max height
          quality: 0.8, // 80% quality
          format: 'webp',
        }
      );

      // Step 2: Generate upload URL
      const urlResult = await generateUploadUrl();
      if (!urlResult.success || !urlResult.uploadUrl) {
        throw new Error(urlResult.message || 'Failed to generate upload URL');
      }

      console.log('Upload URL:', urlResult.uploadUrl);

      // Step 3: Upload compressed image to the URL
      console.log('Uploading compressed image data, size:', compressedBlob.base64.length);

      const response = await fetch(urlResult.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/webp',
        },
        // @ts-expect-error - TODO: fix type error
        body: compressedBlob,
      });

      console.log('Upload response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Upload response data:', responseData);

      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response format from upload server');
      }

      const { storageId } = responseData;

      if (!storageId) {
        throw new Error('No storageId returned from upload server');
      }

      // Step 4: Save the uploaded photo
      const saveResult = await saveUploadedPhoto({
        storageId,
        fileName: `maintenance-photo-${Date.now()}.webp`,
        contentType: 'image/webp',
      });

      if (!saveResult.success || !saveResult.fileUrl) {
        throw new Error(saveResult.message || 'Failed to save uploaded photo');
      }

      return saveResult.fileUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleStatusUpdate = async (status: UpdateableMaintenanceRequestStatus, description?: string) => {
    if (!request) return;

    try {
      await updateStatus({
        requestId: request._id,
        status: status,
        description,
      });
      Alert.alert('Success', `Request status updated to ${status.replace('_', ' ')}`);
    } catch {
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handlePhotoSelected = async (uri: string, base64: string) => {
    if (!request) return;

    try {
      Alert.alert('Photo Type', 'What type of photo is this?', [
        { text: 'Before', onPress: () => addPhotoToRequest('before', uri) },
        { text: 'During', onPress: () => addPhotoToRequest('during', uri) },
        { text: 'After', onPress: () => addPhotoToRequest('after', uri) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to process photo');
    }
  };

  const addPhotoToRequest = async (photoType: 'before' | 'during' | 'after', uri: string) => {
    if (!request) return;

    try {
      // Upload image and get URL
      const photoUrl = await uploadImage(uri);

      // Add photo to maintenance request
      await addPhoto({
        requestId: request._id,
        photoUrl,
        photoType,
        description: `${photoType} photo of maintenance work`,
      });

      Alert.alert('Success', `${photoType} photo added successfully`);
    } catch {
      Alert.alert('Error', 'Failed to add photo to request');
    }
  };

  const handleUpdateCost = () => {
    setShowCostModal(true);
  };

  const handleCostSave = async (costData: {
    materialsCost: number;
    laborHours: number;
    laborRate: number;
    notes: string;
  }) => {
    if (!request) return;

    try {
      await updateCost({
        requestId: request._id,
        materialsCost: costData.materialsCost,
        laborHours: costData.laborHours,
        laborRate: costData.laborRate,
        notes: costData.notes,
      });

      Alert.alert('Success', 'Cost updated successfully');
      setShowCostModal(false);
    } catch {
      Alert.alert('Error', 'Failed to update cost');
    }
  };

  const handleRequestApproval = async () => {
    if (!request) return;

    try {
      await requestApproval({ requestId: request._id });
      Alert.alert('Success', 'Tenant approval requested successfully');
    } catch {
      Alert.alert('Error', 'Failed to request tenant approval');
    }
  };

  const handleAddUpdate = async (updateData: {
    description: string;
    photos: string[];
    statusUpdate?: UpdateableMaintenanceRequestStatus;
  }) => {
    if (!request) return;

    try {
      // Check if current status is updateable
      const updateableStatuses: UpdateableMaintenanceRequestStatus[] = [
        'assigned',
        'in_progress',
        'completed',
        'cancelled',
      ];

      if (!updateableStatuses.includes(request.status as UpdateableMaintenanceRequestStatus)) {
        // For non-updateable statuses like 'pending', we can't use updateRequestStatus
        // Show an error or use an alternative approach
        Alert.alert('Info', 'Updates can only be added to assigned or in-progress requests');
        setShowUpdateModal(false);
        return;
      }

      // Upload photos first if any were selected
      let uploadedPhotoUrls: string[] = [];
      if (updateData.photos.length > 0) {
        try {
          // Show uploading progress
          Alert.alert('Uploading Photos', 'Please wait while photos are being uploaded...');

          // Upload each photo and collect the URLs
          const uploadPromises = updateData.photos.map(async photoUri => {
            return await uploadImage(photoUri);
          });

          uploadedPhotoUrls = await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          Alert.alert('Error', 'Failed to upload photos. Please try again.');
          return;
        }
      }

      // Determine the status to use: either the status update or keep current
      const statusToUse = updateData.statusUpdate || (request.status as UpdateableMaintenanceRequestStatus);

      // Use the determined status for the update with uploaded photo URLs
      const result = await updateStatus({
        requestId: request._id,
        status: statusToUse,
        description: updateData.description,
        photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : undefined,
      });

      console.log('Update status result:', result);

      if (!result.success) {
        console.error('Update failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to add update');
        return;
      }

      const statusMessage = updateData.statusUpdate
        ? `Update added and status changed to ${updateData.statusUpdate.replace('_', ' ')}`
        : 'Update added successfully';

      Alert.alert('Success', statusMessage);
      setShowUpdateModal(false);

      // Force refresh the request data to show the new update
      // This ensures the maintenance updates appear immediately
      setTimeout(() => {
        console.log('Forcing query refresh...');
        // The query should automatically refresh, but we can add a small delay
      }, 1000);
    } catch (error) {
      console.error('Add update failed:', error);
      Alert.alert('Error', 'Failed to add update');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Icon as={User} size={20} className='text-blue-600' />;
      case 'in_progress':
        return <Icon as={Clock} size={20} className='text-orange-600' />;
      case 'completed':
        return <Icon as={CheckCircle} size={20} className='text-green-600' />;
      case 'cancelled':
        return <Icon as={AlertTriangle} size={20} className='text-red-600' />;
      default:
        return <Icon as={Clock} size={20} className='text-gray-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'in_progress':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200/50 dark:border-red-800/50';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200/50 dark:border-orange-800/50';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-200/50 dark:border-yellow-800/50';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200/50 dark:border-green-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 border-gray-200/50 dark:border-gray-800/50';
    }
  };

  if (!request) {
    return (
      <ThemedView style={{ flex: 1 }} className='bg-background items-center justify-center'>
        <Text className='text-lg'>Loading...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader
        title='Request Details'
        subtitle={request.title}
        type='back'
        rightSlot={
          <View className={`px-3 py-1 rounded-full border border-white/20 ${getStatusColor(request.status)}`}>
            <View className='flex-row items-center gap-2'>
              {getStatusIcon(request.status)}
              <Text className='text-sm font-medium capitalize'>{request.status.replace('_', ' ')}</Text>
            </View>
          </View>
        }
      />

      {/* Top Action Button */}
      {request.status === 'assigned' && (
        <View className='px-5 mt-4 mb-2'>
          <Button
            onPress={() => handleStatusUpdate('in_progress', 'Request accepted and work started')}
            className='w-full bg-blue-600'
            size='lg'
          >
            <Text className='text-white font-semibold'>Accept & Start Request</Text>
          </Button>
        </View>
      )}

      <ScrollView className='flex-1 px-2 mt-4'>
        {/* Basic Info */}
        <View className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-6'>
          <View className='flex-row items-center gap-3 mb-3'>
            <Icon as={Wrench} size={20} className='text-blue-800' />
            <Text className='text-xl font-semibold text-blue-800'>{request.title}</Text>
          </View>

          <Text className='text-muted-foreground mb-4'>{request.description}</Text>

          <View className='flex-row items-center gap-2 mb-2'>
            <Icon as={MapPin} size={16} className='text-muted-foreground' />
            <Text className='text-sm text-muted-foreground'>{request.location}</Text>
          </View>

          <View className='flex-row items-center justify-between'>
            <View className='flex-row items-center gap-2'>
              <Icon as={Building} size={16} className='text-muted-foreground' />
              <Text className='text-sm text-muted-foreground'>
                {request.propertyName}
                {request.unitNumber && ` • Unit ${request.unitNumber}`}
              </Text>
            </View>
            <View className={`px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
              <Text className='text-xs font-medium capitalize'>{request.priority}</Text>
            </View>
          </View>
        </View>

        {/* Requester Info */}
        <View className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-6'>
          <Text className='text-lg font-semibold mb-3 text-blue-800'>Requester Information</Text>

          <View className='flex-row items-center gap-3 mb-2'>
            <Icon as={User} size={16} className='text-muted-foreground' />
            <Text className='text-sm'>{request.requesterName}</Text>
          </View>

          {request.requesterPhone && (
            <View className='flex-row items-center gap-3 mb-2'>
              <Icon as={Phone} size={16} className='text-muted-foreground' />
              <Text className='text-sm'>{request.requesterPhone}</Text>
            </View>
          )}

          <View className='flex-row items-center gap-3'>
            <Icon as={Mail} size={16} className='text-muted-foreground' />
            <Text className='text-sm'>{request.requesterEmail}</Text>
          </View>
        </View>

        {/* Photos */}
        {request.photos && request.photos.length > 0 && (
          <View className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-6'>
            <Text className='text-lg font-semibold mb-3 text-blue-800'>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-2'>
              {request.photos.map((photo: string, index: number) => (
                <Image key={index} source={{ uri: photo }} className='w-20 h-20 rounded-lg' resizeMode='cover' />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Updates History */}
        {updates.length > 0 && (
          <View className='bg-card p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-6'>
            <Text className='text-lg font-bold text-blue-800 mb-3'>Updates History</Text>
            {updates.map((update: any) => (
              <View
                key={update._id}
                className='border-b border-gray-200/30 dark:border-gray-700/30 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0'
              >
                <View className='flex-row items-center justify-between mb-0'>
                  <Text className='text-sm font-bold'>{update.updatedByName}</Text>
                  <Text className='text-xs text-muted-foreground'>{formatDate(new Date(update.timestamp))}</Text>
                </View>
                <Text className='text-xs text-gray-600 mb-4'>{update.description}</Text>
                {update.photos && update.photos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-1'>
                    {update.photos.map((photo: string, index: number) => (
                      <Image key={index} source={{ uri: photo }} className='w-12 h-12 rounded' resizeMode='cover' />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className='mb-8 gap-3'>
          {/* Status Update */}
          {request.status !== 'completed' && request.status !== 'cancelled' && (
            <View className='gap-2'>
              <Text className='text-lg font-semibold mb-3 text-blue-800'>Update Status</Text>
              <View className='flex-row gap-2'>
                {request.status === 'assigned' && (
                  <>
                    <Button
                      onPress={() => handleStatusUpdate('in_progress', 'Request accepted - work has been assigned')}
                      className='flex-1'
                      variant='default'
                    >
                      <Text>Accept Request</Text>
                    </Button>
                    <Button
                      onPress={() => handleStatusUpdate('in_progress', 'Started working on the request')}
                      className='flex-1'
                      variant='secondary'
                    >
                      <Text>Start Work</Text>
                    </Button>
                  </>
                )}
                {request.status === 'in_progress' && (
                  <Button
                    onPress={() => handleStatusUpdate('completed', 'Work completed successfully')}
                    className='flex-1'
                    variant='default'
                  >
                    <Text>Mark Complete</Text>
                  </Button>
                )}
              </View>
            </View>
          )}

          {/* Photo Documentation */}
          <PhotoPicker onPhotoSelected={handlePhotoSelected} buttonText='Add Photo'>
            <View className='flex-row items-center gap-2 p-3 bg-secondary rounded-lg'>
              <Icon as={Camera} size={16} className='text-muted-foreground' />
              <Text className='text-sm text-muted-foreground'>Add Photo</Text>
            </View>
          </PhotoPicker>

          {/* Cost Tracking */}
          <Button onPress={handleUpdateCost} variant='secondary' className='w-full gap-2'>
            <Icon as={DollarSign} size={16} className='text-blue-800' />
            <Text>Update Cost</Text>
          </Button>

          {/* Add Update */}
          <Button onPress={() => setShowUpdateModal(true)} variant='secondary' className='w-full gap-2'>
            <Icon as={MessageSquare} size={16} className='text-blue-800' />
            <Text>Add Update</Text>
          </Button>

          {/* Request Tenant Approval */}
          {request.status === 'completed' && request.tenantApproval === undefined && (
            <Button onPress={handleRequestApproval} variant='default' className='w-full gap-2'>
              <Icon as={MessageSquare} size={16} className='text-white' />
              <Text className='text-white'>Request Tenant Approval</Text>
            </Button>
          )}
        </View>
      </ScrollView>

      {/* Cost Tracker Modal */}
      <CostTrackerModal visible={showCostModal} onClose={() => setShowCostModal(false)} onSave={handleCostSave} />

      {/* Add Update Modal */}
      <AddUpdateModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleAddUpdate}
        currentStatus={request.status}
      />
    </ThemedView>
  );
}
