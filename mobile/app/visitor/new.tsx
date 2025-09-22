import React from 'react';
import { ScrollView, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { Dropdown } from '@/components/ui/dropdown';
import { Icon } from '@/components/ui/icon';
import { Users, Calendar, Clock, Building2, Home, Camera, X, FileImage } from 'lucide-react-native';
import { Id } from '@convex/_generated/dataModel';
import { usePropertyStore } from '@/stores/user.store';
import { compressImage } from '@/lib/image-utils';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Error boundary specifically for DateTimePicker dismiss errors
class DateTimePickerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    // Catch specific dismiss errors
    if (error.message?.includes("Cannot read property 'dismiss'")) {
      console.log('Caught DateTimePicker dismiss error, recovering gracefully');
      return { hasError: true };
    }
    throw error; // Re-throw other errors
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message?.includes("Cannot read property 'dismiss'")) {
      console.warn('DateTimePicker dismiss error caught:', error.message);
      // Reset error state after a brief delay
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Return null to hide the picker gracefully
    }
    return this.props.children;
  }
}

interface FormData {
  propertyId: Id<'properties'> | string;
  unitId: Id<'units'> | string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorIdNumber: string;
  visitorIdType: 'driver_license' | 'passport' | 'national_id' | 'others';
  purpose: string;
  expectedArrival: string;
  expectedDeparture: string;
  numberOfVisitors: string;
}

export default function NewVisitorRequestScreen() {
  const router = useRouter();
  const requestVisitorPass = useMutation(api.visitorRequest.requestVisitorPass);
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  const saveUploadedDocument = useMutation(api.visitorRequest.saveUploadedVisitorDocument);
  const deleteUploadedFile = useMutation(api.file.deleteUploadedFile);
  const { selectedPropertyId, selectedUnit, setSelectedPropertyId, setSelectedUnit } = usePropertyStore();

  // Get user's properties and units using the same queries as properties screen
  const myProperties = useQuery(api.property.getMyProperties);
  const myUnits = useQuery(api.unit.getMyUnits);

  const [formData, setFormData] = React.useState<FormData>({
    propertyId: selectedPropertyId || '',
    unitId: selectedUnit?._id || '',
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitorIdNumber: '',
    visitorIdType: 'driver_license',
    purpose: '',
    expectedArrival: '',
    expectedDeparture: '',
    numberOfVisitors: '1',
  });

  // Enhanced date picker state with single picker approach
  const [pickerState, setPickerState] = React.useState<{
    isVisible: boolean;
    mode: 'arrival' | 'departure' | null;
    currentDate: Date;
  }>({
    isVisible: false,
    mode: null,
    currentDate: new Date(),
  });

  const [arrivalDate, setArrivalDate] = React.useState(new Date());
  const [departureDate, setDepartureDate] = React.useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours later

  // Refs for safe cleanup
  const isMountedRef = React.useRef(true);
  const pickerTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enhanced cleanup effect
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pickerTimeoutRef.current) {
        clearTimeout(pickerTimeoutRef.current);
      }
      // Safely hide picker only if component is still mounted
      try {
        setPickerState(prev => ({ ...prev, isVisible: false, mode: null }));
      } catch (error) {
        console.warn('Error during picker cleanup:', error);
      }
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedImages, setUploadedImages] = React.useState<
    {
      uri: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: number;
      storageId: Id<'_storage'>;
    }[]
  >([]);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  // Process query results
  const userUnits = myUnits?.success ? myUnits.units : [];

  // Sync store selection with form data
  React.useEffect(() => {
    if (selectedPropertyId !== formData.propertyId) {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId || '', unitId: '' }));
    }
  }, [selectedPropertyId, formData.propertyId]);

  React.useEffect(() => {
    if (selectedUnit?._id !== formData.unitId) {
      setFormData(prev => ({ ...prev, unitId: selectedUnit?._id || '' }));
    }
  }, [selectedUnit, formData.unitId]);

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.propertyId ||
      !formData.unitId ||
      !formData.visitorName ||
      !formData.purpose ||
      !formData.expectedArrival ||
      !formData.numberOfVisitors
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (arrivalDate <= new Date()) {
      Alert.alert('Error', 'Arrival time must be in the future');
      return;
    }

    if (departureDate && departureDate <= arrivalDate) {
      Alert.alert('Error', 'Departure time must be after arrival time');
      return;
    }

    const visitorCount = parseInt(formData.numberOfVisitors);
    if (isNaN(visitorCount) || visitorCount < 1 || visitorCount > 10) {
      Alert.alert('Error', 'Please enter a valid number of visitors between 1 and 10');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare documents array
      const documents = uploadedImages.map(img => ({
        fileName: img.fileName,
        storageId: img.storageId as Id<'_storage'>,
        fileUrl: img.fileUrl || '',
        uploadedAt: img.uploadedAt,
      }));

      const result = await requestVisitorPass({
        propertyId: formData.propertyId as Id<'properties'>,
        unitId: formData.unitId as Id<'units'>,
        visitorName: formData.visitorName.trim(),
        visitorEmail: formData.visitorEmail.trim() || undefined,
        visitorPhone: formData.visitorPhone.trim() || undefined,
        visitorIdNumber: formData.visitorIdNumber.trim() || undefined,
        visitorIdType: formData.visitorIdType === 'others' ? undefined : formData.visitorIdType,
        purpose: formData.purpose.trim(),
        expectedArrival: arrivalDate.getTime(),
        expectedDeparture: departureDate.getTime(),
        numberOfVisitors: visitorCount,
        documents: documents.length > 0 ? documents : undefined,
      });

      if (result.success && result.requestId) {
        // Save uploaded images to the request if any were uploaded
        if (uploadedImages.length > 0) {
          for (const image of uploadedImages) {
            try {
              await saveUploadedDocument({
                requestId: result.requestId,
                storageId: image.storageId,
                fileName: image.fileName,
                contentType: 'image/webp',
              });
            } catch (docError) {
              console.error('Failed to save document to request:', docError);
              // Continue with other images even if one fails
            }
          }
        }

        Alert.alert('Success', result.message || 'Visitor request submitted successfully', [
          {
            text: 'OK',
            onPress: () => router.replace('/visitor'),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to submit visitor request');
      }
    } catch {
      Alert.alert('Error', 'Failed to submit visitor request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Update store when property/unit changes
    if (field === 'propertyId') {
      setSelectedPropertyId(value);
      setFormData(prev => ({ ...prev, unitId: '' }));
      setSelectedUnit(null);
    }
    if (field === 'unitId') {
      const unit = userUnits?.find(u => u._id === value);
      setSelectedUnit(unit || null);
    }
  };

  // Single, robust date change handler
  const handleDateChange = React.useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      console.log('handleDateChange', event, selectedDate, 'mode:', pickerState.mode);

      // Clear any existing timeout
      if (pickerTimeoutRef.current) {
        clearTimeout(pickerTimeoutRef.current);
      }

      // Hide picker safely with delayed execution
      const hidePicker = () => {
        if (isMountedRef.current) {
          try {
            setPickerState(prev => ({ ...prev, isVisible: false, mode: null }));
          } catch (error) {
            console.warn('Error hiding picker:', error);
          }
        }
      };

      // Use timeout to prevent race conditions
      pickerTimeoutRef.current = setTimeout(hidePicker, 150);

      try {
        // Only update if user confirmed the selection and component is mounted
        if (event.type === 'set' && selectedDate && isMountedRef.current && pickerState.mode) {
          // Handle timezone offset if provided in nativeEvent
          let finalDate = selectedDate;
          if (event.nativeEvent && 'utcOffset' in event.nativeEvent) {
            const { timestamp, utcOffset } = event.nativeEvent as any;
            finalDate = new Date(timestamp);
            console.log('Using timestamp from nativeEvent:', timestamp, 'utcOffset:', utcOffset);
          }

          if (pickerState.mode === 'arrival') {
            setArrivalDate(finalDate);
            setFormData(prev => ({ ...prev, expectedArrival: finalDate.toISOString() }));
          } else if (pickerState.mode === 'departure') {
            setDepartureDate(finalDate);
            setFormData(prev => ({ ...prev, expectedDeparture: finalDate.toISOString() }));
          }
        }
      } catch (error) {
        console.error('Error handling date change:', error);
      }
    },
    [pickerState.mode]
  );

  // Safe picker display functions
  const showArrivalDatePicker = React.useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      setPickerState({
        isVisible: true,
        mode: 'arrival',
        currentDate: arrivalDate,
      });
    } catch (error) {
      console.error('Error showing arrival picker:', error);
    }
  }, [arrivalDate]);

  const showDepartureDatePicker = React.useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      setPickerState({
        isVisible: true,
        mode: 'departure',
        currentDate: departureDate,
      });
    } catch (error) {
      console.error('Error showing departure picker:', error);
    }
  }, [departureDate]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow access to your photos to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploadingImage(true);

    try {
      console.log('Starting image upload:', asset.uri);

      // Step 1: Compress the image
      const compressedImage = await compressImage(
        { uri: asset.uri },
        {
          width: 1200,
          height: 1200,
          quality: 0.8,
          format: 'webp',
        }
      );

      // Step 2: Generate upload URL
      const urlResult = await generateUploadUrl({});
      if (!urlResult.success || !urlResult.uploadUrl) {
        throw new Error(urlResult.message || 'Failed to generate upload URL');
      }

      // Step 3: Upload compressed image to the URL
      // For React Native, we need to read the file and create proper FormData

      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/webp',
        },
        // @ts-expect-error - Not a type error
        body: compressedImage,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const responseData = await uploadResponse.json();
      const { storageId } = responseData;
      console.log('responseData', responseData);

      if (!storageId) {
        throw new Error('No storageId returned from upload server');
      }

      // Step 4: Save the uploaded photo (we'll do this after creating the request)
      const fileName = `visitor-doc-${Date.now()}.webp`;

      // Add to local state for now (will be saved after request creation)
      setUploadedImages(prev => [
        ...prev,
        {
          uri: compressedImage.uri, // Use compressed image URI
          fileName,
          fileUrl: '', // Will be set after saving
          uploadedAt: Date.now(),
          storageId: storageId as Id<'_storage'>,
        },
      ]);

      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    if (!imageToRemove) return;

    try {
      // Delete from storage first
      const deleteResult = await deleteUploadedFile({
        storageId: imageToRemove.storageId as Id<'_storage'>,
      });

      if (!deleteResult.success) {
        console.warn('Failed to delete file from storage:', deleteResult.message);
        // Still remove from local state even if storage deletion fails
      }

      // Remove from local state
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing image:', error);
      Alert.alert('Error', 'Failed to remove image. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedView style={{ flex: 1 }} className='bg-background'>
        <PageHeader title='New Visitor Request' subtitle='Request access for a visitor' type='back' icon='person-add' />

        <ScrollView className='flex-1 bg-gray-50' contentContainerStyle={{ padding: 20 }}>
          {/* Property Information */}
          <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm'>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={Building2} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Selected Property</Text>
            </View>
            <View className='bg-gray-50 rounded-xl p-4 gap-3'>
              {(() => {
                // Find the selected property - either from the selected unit's property or from the property list
                const currentProperty =
                  selectedUnit?.property ||
                  (myProperties?.success && myProperties.properties
                    ? myProperties.properties.find(p => p._id === selectedPropertyId)
                    : null);
                return currentProperty ? (
                  <>
                    <View className='flex-row items-center gap-2'>
                      <Icon as={Building2} size={18} className='text-blue-600' />
                      <Text className='text-lg font-semibold text-gray-900'>{currentProperty.name}</Text>
                    </View>
                    <View className='gap-1'>
                      <Text className='text-sm text-gray-600'>
                        {currentProperty.address}, {currentProperty.city}, {currentProperty.state}{' '}
                        {currentProperty.zipCode}
                      </Text>
                      <Text className='text-sm text-gray-500 capitalize'>{currentProperty.propertyType}</Text>
                    </View>
                    {selectedUnit && (
                      <View className='mt-2 pt-3 border-t border-gray-200'>
                        <View className='flex-row items-center gap-2'>
                          <Icon as={Home} size={16} className='text-blue-600' />
                          <Text className='text-base font-medium text-gray-900'>Unit {selectedUnit.unitNumber}</Text>
                        </View>
                        {selectedUnit.floor && (
                          <Text className='text-sm text-gray-600'>Floor {selectedUnit.floor}</Text>
                        )}
                      </View>
                    )}
                  </>
                ) : (
                  <View className='items-center py-4'>
                    <Text className='text-gray-500 text-center'>No property selected</Text>
                    <Text className='text-gray-400 text-sm text-center mt-1 mb-4'>
                      Please select a property and unit from the properties screen first
                    </Text>
                  </View>
                );
              })()}
            </View>
          </View>

          {/* Visitor Information */}
          <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm'>
            <View className='flex-row items-center mb-4'>
              <View className='w-1 h-6 bg-green-600 rounded-full mr-3' />
              <Text className='text-xl font-bold text-gray-900'>Visitor Information</Text>
            </View>

            <View className='gap-4'>
              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Visitor Name *</Text>
                <Input
                  value={formData.visitorName}
                  onChangeText={(value: string) => updateFormData('visitorName', value)}
                  placeholder='Enter visitor full name'
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 text-gray-900 font-medium'
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Email (Optional)</Text>
                <Input
                  value={formData.visitorEmail}
                  onChangeText={(value: string) => updateFormData('visitorEmail', value)}
                  placeholder='visitor@example.com'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 text-gray-900 font-medium'
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Phone (Optional)</Text>
                <Input
                  value={formData.visitorPhone}
                  onChangeText={(value: string) => updateFormData('visitorPhone', value)}
                  placeholder='+1 (555) 123-4567'
                  keyboardType='phone-pad'
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 text-gray-900 font-medium'
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>ID Number (Optional)</Text>
                <Input
                  value={formData.visitorIdNumber}
                  onChangeText={(value: string) => updateFormData('visitorIdNumber', value)}
                  placeholder='Enter ID number'
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 text-gray-900 font-medium'
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>ID Type</Text>
                <Dropdown
                  value={formData.visitorIdType}
                  onValueChange={(value: string) => {
                    updateFormData('visitorIdType', value);
                  }}
                  placeholder='Select ID type'
                  data={[
                    { label: "Driver's License", value: 'driver_license' },
                    { label: 'Passport', value: 'passport' },
                    { label: 'National ID', value: 'national_id' },
                    { label: 'Others', value: 'others' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Photo Upload */}
          <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm'>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={Camera} size={20} className='text-blue-800' />
              <Text className='text-lg font-bold text-gray-900'>Visitor Photos</Text>
            </View>

            <View className='gap-4'>
              <Text className='text-sm text-gray-600'>
                Upload photos of the visitor for verification purposes (optional)
              </Text>

              {/* Upload Button */}
              <TouchableOpacity
                onPress={pickImage}
                disabled={isUploadingImage}
                activeOpacity={0.7}
                className='bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-4 items-center justify-center'
              >
                <View className='items-center gap-3'>
                  <Icon as={Camera} size={32} className='text-blue-500' />
                  <Text className='text-blue-700 font-semibold text-center'>
                    {isUploadingImage ? 'Uploading...' : 'Add Visitor Photo'}
                  </Text>
                  <Text className='text-blue-500 text-sm text-center'>Tap to select from gallery or take a photo</Text>
                </View>
              </TouchableOpacity>

              {/* Display Uploaded Images */}
              {uploadedImages.length > 0 && (
                <View className='gap-3'>
                  <Text className='text-sm font-semibold text-gray-800'>Uploaded Photos ({uploadedImages.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-3'>
                    {uploadedImages.map((image, index) => (
                      <View key={index} className='relative'>
                        <View className='w-20 h-20 rounded-xl bg-gray-100 items-center justify-center overflow-hidden'>
                          {image.uri ? (
                            <Image source={{ uri: image.uri }} className='w-full h-full' resizeMode='cover' />
                          ) : (
                            <Icon as={FileImage} size={24} className='text-gray-400' />
                          )}
                        </View>

                        {/* Remove button */}
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          activeOpacity={0.7}
                          className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center'
                        >
                          <Icon as={X} size={14} className='text-white' />
                        </TouchableOpacity>

                        {/* File info */}
                        <Text className='text-xs text-gray-500 mt-1 text-center max-w-[80px]' numberOfLines={1}>
                          {image.fileName}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Visit Details */}
          <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm'>
            <View className='flex-row items-center mb-4'>
              <View className='w-1 h-6 bg-purple-600 rounded-full mr-3' />
              <Text className='text-xl font-bold text-gray-900'>Visit Details</Text>
            </View>

            <View className='gap-4'>
              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Purpose of Visit *</Text>
                <Textarea
                  value={formData.purpose}
                  onChangeText={(value: string) => updateFormData('purpose', value)}
                  placeholder='Describe the purpose of the visit'
                  numberOfLines={4}
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 text-gray-900 font-medium'
                />
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Expected Arrival *</Text>
                <TouchableOpacity
                  onPress={showArrivalDatePicker}
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between'
                >
                  <Text className='text-gray-900 font-medium'>{formatDateTime(arrivalDate)}</Text>
                  <Calendar size={20} className='text-gray-500' />
                </TouchableOpacity>
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Expected Departure *</Text>
                <TouchableOpacity
                  onPress={showDepartureDatePicker}
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between'
                >
                  <Text className='text-gray-900 font-medium'>{formatDateTime(departureDate)}</Text>
                  <Clock size={20} className='text-gray-500' />
                </TouchableOpacity>
              </View>

              <View>
                <Text className='text-sm font-semibold text-gray-800 mb-2'>Number of Visitors *</Text>
                <Input
                  value={formData.numberOfVisitors}
                  onChangeText={(value: string) => updateFormData('numberOfVisitors', value)}
                  placeholder='Enter number of visitors'
                  keyboardType='numeric'
                  className='bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium'
                />
                <Text className='text-xs text-gray-500 mt-1'>Enter a number between 1 and 10</Text>
              </View>
            </View>
          </View>

          {/* Single DateTimePicker with Error Boundary */}
          {pickerState.isVisible && pickerState.mode && (
            <DateTimePickerErrorBoundary>
              <DateTimePicker
                key={`picker-${pickerState.mode}-${Date.now()}`}
                value={pickerState.currentDate}
                mode='date'
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={pickerState.mode === 'arrival' ? new Date() : arrivalDate}
                timeZoneOffsetInMinutes={Platform.OS === 'android' ? undefined : new Date().getTimezoneOffset()}
                style={Platform.OS === 'ios' ? { backgroundColor: 'white' } : undefined}
              />
            </DateTimePickerErrorBoundary>
          )}

          {/* Submit Button */}
          <View className='gap-4 mb-8'>
            <Button onPress={handleSubmit} disabled={isSubmitting} className='rounded-2xl' size='lg'>
              <View className='flex-row items-center justify-center gap-3 py-2'>
                <Users size={20} className='!text-white ' color={'white'} />
                <Text className='text-white font-bold text-lg'>
                  {isSubmitting ? 'Submitting...' : 'Submit Visitor Request'}
                </Text>
              </View>
            </Button>

            <Button onPress={() => router.back()} variant='secondary' className='rounded-2xl' size='lg'>
              <Text className='font-semibold text-lg'>Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
