import React from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PageHeader } from '@/components/ui/page-header';
import { Icon } from '@/components/ui/icon';
import {
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Share2,
  FileText,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { compressImage } from '@/lib/image-utils';

export default function VisitorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const visitorData = useQuery(api.visitorRequest.getVisitorStatus, { requestId: id as Id<'visitorRequests'> });

  const [isUploading, setIsUploading] = React.useState(false);

  // Mutations
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  const saveUploadedVisitorDocument = useMutation(api.visitorRequest.saveUploadedVisitorDocument);

  const visitor = visitorData && 'success' in visitorData && visitorData.success ? visitorData.visitor : null;
  const isLoading = visitorData === undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'denied':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className='text-green-600' />;
      case 'pending':
        return <Clock size={20} className='text-yellow-600' />;
      case 'denied':
        return <XCircle size={20} className='text-red-600' />;
      case 'cancelled':
        return <XCircle size={20} className='text-gray-600' />;
      default:
        return <Clock size={20} className='text-gray-400' />;
    }
  };

  const handleDocumentUpload = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      // Check file size (limit to 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      setIsUploading(true);

      console.log('Starting document upload:', file.uri);

      // Step 1: Compress if it's an image, otherwise read as blob
      let fileData;
      if (file.mimeType?.includes('image')) {
        // Compress image for images
        fileData = await compressImage(
          { uri: file.uri },
          {
            width: 1200,
            height: 1200,
            quality: 0.8,
            format: 'webp',
          }
        );
      } else {
        // For non-image files, read as blob
        const response = await fetch(file.uri);
        fileData = await response.blob();
      }

      // Step 2: Generate upload URL
      const urlResult = await generateUploadUrl({});
      if (!urlResult.success || !urlResult.uploadUrl) {
        throw new Error(urlResult.message || 'Failed to generate upload URL');
      }

      // Step 3: Upload file to the URL
      // For React Native, we need to read the file and create proper FormData

      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.mimeType?.includes('image') ? 'image/webp' : file.mimeType || 'application/octet-stream',
        },
        // @ts-expect-error - Not a type error
        body: fileData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed response:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const responseData = await uploadResponse.json();
      const { storageId } = responseData;
      console.log('responseData', responseData);

      if (!storageId) {
        throw new Error('No storageId returned from upload server');
      }

      // Step 4: Save the uploaded document to the visitor request
      const saveResult = await saveUploadedVisitorDocument({
        requestId: id as Id<'visitorRequests'>,
        storageId,
        fileName: file.name || `document-${Date.now()}.${file.mimeType?.includes('image') ? 'webp' : 'pdf'}`,
        contentType: file.mimeType?.includes('image') ? 'image/webp' : file.mimeType || 'application/octet-stream',
        documentType,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.message || 'Failed to save uploaded document');
      }

      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareDetails = async () => {
    if (!visitor) return;

    try {
      const message = `Visitor Pass Details:
Name: ${visitor.visitorName}
Purpose: ${visitor.purpose}
Arrival: ${new Date(visitor.expectedArrival).toLocaleString()}
Status: ${visitor.status.toUpperCase()}`;

      await Share.share({
        message,
      });
    } catch {
      Alert.alert('Error', 'Failed to share visitor details');
    }
  };

  const handleCallVisitor = () => {
    if (!visitor?.visitorPhone) {
      Alert.alert('Error', 'No phone number available');
      return;
    }

    Linking.openURL(`tel:${visitor.visitorPhone}`);
  };

  const handleEmailVisitor = () => {
    if (!visitor?.visitorEmail) {
      Alert.alert('Error', 'No email address available');
      return;
    }

    Linking.openURL(`mailto:${visitor.visitorEmail}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1 }} className='bg-background'>
        <PageHeader title='Visitor Details' subtitle='Loading...' type='back' icon='person' />
        <View className='flex-1 items-center justify-center bg-slate-50'>
          <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
            <View className='w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin' />
          </View>
          <Text className='text-xl font-bold text-blue-800 mb-2'>Loading visitor details...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!visitor) {
    return (
      <ThemedView style={{ flex: 1 }} className='bg-background'>
        <PageHeader title='Visitor Details' subtitle='Not found' type='back' icon='person' />
        <View className='flex-1 items-center justify-center bg-slate-50'>
          <Icon as={Users} size={64} className='text-gray-400 mb-5' />
          <Text className='text-xl font-bold text-gray-800 mb-2'>Visitor not found</Text>
          <Text className='text-gray-600 text-center mb-6'>
            The visitor request you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </Text>
          <Button onPress={() => router.back()}>
            <Text className='text-white font-semibold'>Go Back</Text>
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader
        title='Visitor Details'
        subtitle={visitor.visitorName}
        type='back'
        icon='person'
        rightSlot={
          <TouchableOpacity onPress={handleShareDetails} className='p-2'>
            <Icon as={Share2} size={20} className='text-blue-600' />
          </TouchableOpacity>
        }
      />

      <ScrollView className='flex-1 bg-slate-50'>
        {/* Enhanced Status Card */}
        <View className='mx-5 mt-5 mb-3'>
          <View className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            {/* Status Header with Gradient */}
            <View className={`px-6 py-5 ${getStatusColor(visitor.status)} relative`}>
              {/* Background Pattern */}
              <View className='absolute inset-0 opacity-10'>
                <View className='absolute top-0 right-0 w-20 h-20 rounded-full bg-white/20' />
                <View className='absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/15' />
              </View>

              <View className='flex-row items-center justify-between relative z-10'>
                <View className='flex-row items-center flex-1'>
                  <View className='mr-4'>{getStatusIcon(visitor.status)}</View>
                  <View className='flex-1'>
                    <Text className='text-xl font-bold capitalize mb-1'>{visitor.status}</Text>
                    <Text className='text-sm opacity-80 font-medium'>
                      {visitor.status === 'approved' && 'Visitor access granted'}
                      {visitor.status === 'pending' && 'Awaiting approval'}
                      {visitor.status === 'denied' && 'Request declined'}
                      {visitor.status === 'cancelled' && 'Request cancelled'}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  className={`px-3 py-1.5 rounded-full ${
                    visitor.status === 'approved'
                      ? 'bg-green-500/20 border border-green-400/30'
                      : visitor.status === 'pending'
                        ? 'bg-yellow-500/20 border border-yellow-400/30'
                        : visitor.status === 'denied'
                          ? 'bg-red-500/20 border border-red-400/30'
                          : 'bg-gray-500/20 border border-gray-400/30'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wide ${
                      visitor.status === 'approved'
                        ? 'text-green-700'
                        : visitor.status === 'pending'
                          ? 'text-yellow-700'
                          : visitor.status === 'denied'
                            ? 'text-red-700'
                            : 'text-gray-700'
                    }`}
                  >
                    {visitor.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Details */}
            <View className='px-6 py-4 bg-gray-50/50'>
              <View className='flex-row items-center justify-between'>
                <View className='flex-row items-center'>
                  <Icon as={Clock} size={16} className='text-gray-500 mr-2' />
                  <Text className='text-sm text-gray-600 font-medium'>
                    {visitor.status === 'approved' && visitor.approvedAt
                      ? `Approved on ${new Date(visitor.approvedAt).toLocaleDateString()}`
                      : visitor.status === 'pending'
                        ? 'Submitted for review'
                        : visitor.status === 'denied'
                          ? 'Review completed'
                          : 'Request cancelled'}
                  </Text>
                </View>

                {/* Progress Indicator for Pending */}
                {visitor.status === 'pending' && (
                  <View className='flex-row items-center'>
                    <View className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-1' />
                    <Text className='text-xs text-yellow-600 font-medium'>Processing</Text>
                  </View>
                )}
              </View>

              {/* Additional Status Info */}
              {visitor.status === 'approved' && visitor.expectedArrival && (
                <View className='mt-3 pt-3 border-t border-gray-200/50'>
                  <View className='flex-row items-center'>
                    <Icon as={Calendar} size={14} className='text-green-600 mr-2' />
                    <Text className='text-xs text-gray-600'>
                      Expected arrival:{' '}
                      <Text className='font-medium text-green-700'>
                        {new Date(visitor.expectedArrival).toLocaleString()}
                      </Text>
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Visitor Information */}
        <View className='mx-5 mb-3'>
          <View className='bg-white rounded-xl p-4 border border-gray-100'>
            <Text className='text-lg font-semibold text-gray-900 mb-4'>Visitor Information</Text>

            <View className='gap-3'>
              <View className='flex-row items-center'>
                <Icon as={Users} size={18} className='text-blue-500 mr-3' />
                <View className='flex-1'>
                  <Text className='text-sm text-gray-500'>Name</Text>
                  <Text className='text-base font-medium text-gray-900'>{visitor.visitorName}</Text>
                </View>
              </View>

              {visitor.visitorEmail && (
                <View className='flex-row items-center'>
                  <Icon as={Mail} size={18} className='text-blue-500 mr-3' />
                  <View className='flex-1'>
                    <Text className='text-sm text-gray-500'>Email</Text>
                    <TouchableOpacity onPress={handleEmailVisitor}>
                      <Text className='text-base font-medium text-blue-600 underline'>{visitor.visitorEmail}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {visitor.visitorPhone && (
                <View className='flex-row items-center'>
                  <Icon as={Phone} size={18} className='text-blue-500 mr-3' />
                  <View className='flex-1'>
                    <Text className='text-sm text-gray-500'>Phone</Text>
                    <TouchableOpacity onPress={handleCallVisitor}>
                      <Text className='text-base font-medium text-blue-600 underline'>{visitor.visitorPhone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View className='flex-row items-center'>
                <Icon as={CreditCard} size={18} className='text-blue-500 mr-3' />
                <View className='flex-1'>
                  <Text className='text-sm text-gray-500'>Purpose</Text>
                  <Text className='text-base font-medium text-gray-900'>{visitor.purpose}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Visit Details */}
        <View className='mx-5 mb-3'>
          <View className='bg-white rounded-xl p-4 border border-gray-100'>
            <Text className='text-lg font-semibold text-gray-900 mb-4'>Visit Details</Text>

            <View className='gap-3'>
              <View className='flex-row items-center'>
                <Icon as={Calendar} size={18} className='text-blue-500 mr-3' />
                <View className='flex-1'>
                  <Text className='text-sm text-gray-500'>Expected Arrival</Text>
                  <Text className='text-base font-medium text-gray-900'>
                    {new Date(visitor.expectedArrival).toLocaleString()}
                  </Text>
                </View>
              </View>

              {visitor.expectedDeparture && (
                <View className='flex-row items-center'>
                  <Icon as={Clock} size={18} className='text-blue-500 mr-3' />
                  <View className='flex-1'>
                    <Text className='text-sm text-gray-500'>Expected Departure</Text>
                    <Text className='text-base font-medium text-gray-900'>
                      {new Date(visitor.expectedDeparture).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <View className='flex-row items-center'>
                <Icon as={Users} size={18} className='text-blue-500 mr-3' />
                <View className='flex-1'>
                  <Text className='text-sm text-gray-500'>Number of Visitors</Text>
                  <Text className='text-base font-medium text-gray-900'>{visitor.numberOfVisitors}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Check-in/out Status */}
        {(visitor.checkInTime || visitor.checkOutTime) && (
          <View className='mx-5 mb-3'>
            <View className='bg-white rounded-xl p-4 border border-gray-100'>
              <Text className='text-lg font-semibold text-gray-900 mb-4'>Visit Status</Text>

              <View className='gap-3'>
                {visitor.checkInTime && (
                  <View className='flex-row items-center'>
                    <CheckCircle size={18} className='text-green-500 mr-3' />
                    <View className='flex-1'>
                      <Text className='text-sm text-gray-500'>Checked In</Text>
                      <Text className='text-base font-medium text-gray-900'>
                        {new Date(visitor.checkInTime).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}

                {visitor.checkOutTime && (
                  <View className='flex-row items-center'>
                    <CheckCircle size={18} className='text-blue-500 mr-3' />
                    <View className='flex-1'>
                      <Text className='text-sm text-gray-500'>Checked Out</Text>
                      <Text className='text-base font-medium text-gray-900'>
                        {new Date(visitor.checkOutTime).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Documents */}
        <View className='mx-5 mb-3'>
          <View className='bg-white rounded-xl p-4 border border-gray-100'>
            <Text className='text-lg font-semibold text-gray-900 mb-4'>Documents</Text>

            {visitor.documents && visitor.documents.length > 0 ? (
              <View className='gap-3'>
                {visitor.documents
                  .filter((doc: any) => doc && typeof doc === 'object')
                  .map((doc: any, index: number) => {
                    // Handle different possible document structures
                    const fileName = doc.fileName || doc.name || 'Unknown file';
                    const fileUrl = doc.fileUrl || doc.url || '';
                    const uploadedAt = doc.uploadedAt || doc.createdAt || null;

                    return (
                      <View key={index} className='flex-row items-center p-3 bg-gray-50 rounded-lg'>
                        <Icon as={FileText} size={18} className='text-blue-500 mr-3' />
                        <View className='flex-1'>
                          <Text className='text-sm font-medium text-gray-900'>{fileName}</Text>
                          <Text className='text-xs text-gray-500'>
                            Uploaded {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : 'Unknown date'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (fileUrl && fileUrl.trim()) {
                              Linking.openURL(fileUrl);
                            } else {
                              Alert.alert('Error', 'Document URL is not available');
                            }
                          }}
                          disabled={!fileUrl || !fileUrl.trim()}
                          className={`px-3 py-1 rounded-lg ${
                            fileUrl && fileUrl.trim() ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                        >
                          <Text className='text-white text-xs font-semibold'>View</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
              </View>
            ) : (
              <Text className='text-gray-500 text-center py-4'>No documents uploaded yet</Text>
            )}

            {/* Upload Button */}
            {['pending', 'approved'].includes(visitor.status) && (
              <View className='mt-4 pt-4 border-t border-gray-200'>
                <Button
                  onPress={() => handleDocumentUpload('id_card')}
                  disabled={isUploading}
                  className='bg-blue-600 disabled:bg-gray-400'
                >
                  <View className='flex-row items-center justify-center gap-2 py-1'>
                    <Icon as={Upload} size={18} className='text-white' />
                    <Text className='text-white font-semibold'>{isUploading ? 'Uploading...' : 'Upload Document'}</Text>
                  </View>
                </Button>
              </View>
            )}
          </View>
        </View>

        {/* Denied Reason */}
        {visitor.deniedReason && (
          <View className='mx-5 mb-3'>
            <View className='bg-red-50 rounded-xl p-4 border border-red-200'>
              <View className='flex-row items-center mb-2'>
                <Icon as={AlertTriangle} size={18} className='text-red-600 mr-2' />
                <Text className='text-base font-semibold text-red-800'>Request Denied</Text>
              </View>
              <Text className='text-red-700'>{visitor.deniedReason}</Text>
            </View>
          </View>
        )}

        <View className='h-8' />
      </ScrollView>
    </ThemedView>
  );
}
