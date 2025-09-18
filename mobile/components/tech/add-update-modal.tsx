import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { X, MessageSquare, Camera, FileText, ChevronDown } from 'lucide-react-native';
import { TextField } from '../ui/TextField';
import { PhotoPicker } from './photo-picker';
import { UpdateableMaintenanceRequestStatus } from '@/lib/tech.types';

interface AddUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: UpdateData) => void;
  currentStatus: string;
}

interface UpdateData {
  description: string;
  photos: string[];
  statusUpdate?: UpdateableMaintenanceRequestStatus;
}

export function AddUpdateModal({ visible, onClose, onSave, currentStatus }: AddUpdateModalProps) {
  const [description, setDescription] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [statusUpdate, setStatusUpdate] = useState<UpdateableMaintenanceRequestStatus | null>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const handlePhotoSelected = (uri: string, base64: string) => {
    setSelectedPhotos(prev => [...prev, uri]);
  };

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an update description');
      return;
    }

    onSave({
      description: description.trim(),
      photos: selectedPhotos,
      statusUpdate: statusUpdate || undefined,
    });

    // Reset form
    setDescription('');
    setSelectedPhotos([]);
    setStatusUpdate(null);
    setShowStatusOptions(false);
  };

  const handleClose = () => {
    setDescription('');
    setSelectedPhotos([]);
    setStatusUpdate(null);
    setShowStatusOptions(false);
    onClose();
  };

  const getStatusOptions = () => {
    const options: { value: UpdateableMaintenanceRequestStatus; label: string }[] = [];

    if (currentStatus === 'assigned') {
      options.push({ value: 'in_progress', label: 'In Progress' }, { value: 'cancelled', label: 'Cancelled' });
    } else if (currentStatus === 'in_progress') {
      options.push({ value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' });
    }

    return options;
  };

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View className='flex-1 bg-black/50 items-center justify-end'>
        <View className='bg-white dark:bg-gray-900 rounded-t-3xl w-full max-h-4/5 border-t border-gray-200/50 dark:border-gray-700/50'>
          {/* Header */}
          <View className='flex-row justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50'>
            <View className='flex-row items-center gap-3'>
              <View className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center'>
                <Icon as={MessageSquare} size={20} className='text-blue-600' />
              </View>
              <View>
                <Text className='text-xl font-semibold text-foreground'>Add Update</Text>
                <Text className='text-sm text-muted-foreground'>Add progress update to the request</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Icon as={X} size={24} className='text-muted-foreground' />
            </TouchableOpacity>
          </View>

          <ScrollView className='p-6'>
            {/* Description */}
            <View className='mb-6'>
              <View className='flex-row items-center gap-2 mb-2'>
                <Icon as={FileText} size={16} className='text-muted-foreground' />
                <Text className='text-sm font-medium text-foreground'>Update Description</Text>
              </View>
              <TextField
                placeholder='Describe the progress or work completed...'
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                className='min-h-24'
              />
            </View>

            {/* Status Update */}
            {getStatusOptions().length > 0 && (
              <View className='mb-6'>
                <View className='flex-row items-center gap-2 mb-2'>
                  <Icon as={MessageSquare} size={16} className='text-muted-foreground' />
                  <Text className='text-sm font-medium text-foreground'>Update Status (Optional)</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setShowStatusOptions(!showStatusOptions)}
                  className='flex-row items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50'
                >
                  <Text className='text-sm text-foreground'>
                    {statusUpdate
                      ? statusUpdate.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Keep current status'}
                  </Text>
                  <Icon as={ChevronDown} size={16} className='text-muted-foreground' />
                </TouchableOpacity>

                {showStatusOptions && (
                  <View className='mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50'>
                    <TouchableOpacity
                      onPress={() => {
                        setStatusUpdate(null);
                        setShowStatusOptions(false);
                      }}
                      className='p-3 border-b border-gray-200/50 dark:border-gray-700/50'
                    >
                      <Text className='text-sm text-foreground'>Keep current status</Text>
                    </TouchableOpacity>
                    {getStatusOptions().map(option => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          setStatusUpdate(option.value);
                          setShowStatusOptions(false);
                        }}
                        className='p-3'
                      >
                        <Text className='text-sm text-foreground'>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Photos */}
            <View className='mb-6'>
              <View className='flex-row items-center gap-2 mb-3'>
                <Icon as={Camera} size={16} className='text-muted-foreground' />
                <Text className='text-sm font-medium text-foreground'>Photos (Optional)</Text>
                {selectedPhotos.length > 0 && (
                  <Text className='text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>
                    {selectedPhotos.length} selected
                  </Text>
                )}
              </View>

              <PhotoPicker onPhotoSelected={handlePhotoSelected} buttonText='Add Photo'>
                <View className='flex-row items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50'>
                  <Icon as={Camera} size={16} className='text-muted-foreground' />
                  <Text className='text-sm text-muted-foreground'>Add Photo</Text>
                </View>
              </PhotoPicker>

              {selectedPhotos.length > 0 && (
                <View className='mt-3'>
                  <Text className='text-xs text-muted-foreground mb-2'>Selected Photos:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-2'>
                    {selectedPhotos.map((photo, index) => (
                      <View key={index} className='relative'>
                        <View className='w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg items-center justify-center'>
                          <Icon as={Camera} size={20} className='text-muted-foreground' />
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== index))}
                          className='absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center'
                        >
                          <Icon as={X} size={12} className='text-white' />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className='flex-row gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50'>
            <Button onPress={handleClose} variant='outline' className='flex-1 gap-2'>
              <Icon as={X} size={16} />
              <Text>Cancel</Text>
            </Button>
            <Button onPress={handleSave} variant='default' className='flex-1 gap-2'>
              <Icon as={MessageSquare} size={16} className='text-white' />
              <Text>Add Update</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
