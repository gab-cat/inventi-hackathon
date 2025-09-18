import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { Icon } from '../ui/icon';
import { Camera, ImageIcon, X, Upload } from 'lucide-react-native';

interface PhotoPickerProps {
  onPhotoSelected: (uri: string, base64: string) => void;
  children?: React.ReactNode;
  buttonText?: string;
}

export function PhotoPicker({ onPhotoSelected, children, buttonText = 'Add Photo' }: PhotoPickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and photo library permissions are required to add photos.', [
        { text: 'OK' },
      ]);
      return false;
    }
    return true;
  };

  const pickFromCamera = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        if (asset.base64) {
          onPhotoSelected(asset.uri, asset.base64);
        }
        setShowOptions(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromLibrary = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        if (asset.base64) {
          onPhotoSelected(asset.uri, asset.base64);
        }
        setShowOptions(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handlePress = () => {
    setShowOptions(true);
  };

  const clearSelection = () => {
    setSelectedImage(null);
  };

  if (children) {
    return (
      <>
        <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>

        <Modal visible={showOptions} transparent animationType='fade'>
          <View className='flex-1 bg-black/50 items-center justify-center p-4'>
            <View className='bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-200/50 dark:border-gray-700/50'>
              <View className='flex-row justify-between items-center mb-4'>
                <Text className='text-lg font-semibold text-foreground'>Add Photo</Text>
                <TouchableOpacity onPress={() => setShowOptions(false)}>
                  <Icon as={X} size={20} className='text-muted-foreground' />
                </TouchableOpacity>
              </View>

              <View className='gap-3'>
                <Button onPress={pickFromCamera} variant='outline' className='w-full justify-start gap-3'>
                  <Icon as={Camera} size={20} />
                  <Text className='font-medium'>Take Photo</Text>
                </Button>

                <Button onPress={pickFromLibrary} variant='outline' className='w-full justify-start gap-3'>
                  <Icon as={ImageIcon} size={20} />
                  <Text className='font-medium'>Choose from Gallery</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View>
      {selectedImage ? (
        <View className='relative'>
          <Image source={{ uri: selectedImage }} className='w-20 h-20 rounded-lg' />
          <TouchableOpacity
            onPress={clearSelection}
            className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center'
          >
            <Icon as={X} size={12} className='text-white' />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handlePress} className='flex-row items-center gap-2 p-3 bg-secondary rounded-lg'>
          <Icon as={Upload} size={16} className='text-muted-foreground' />
          <Text className='text-sm text-muted-foreground'>{buttonText}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showOptions} transparent animationType='fade'>
        <View className='flex-1 bg-black/50 items-center justify-center p-4'>
          <View className='bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-200/50 dark:border-gray-700/50'>
            <View className='flex-row justify-between items-center mb-4'>
              <Text className='text-lg font-semibold text-foreground'>Add Photo</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Icon as={X} size={20} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>

            <View className='gap-3'>
              <Button onPress={pickFromCamera} variant='outline' className='w-full justify-start gap-3'>
                <Icon as={Camera} size={20} />
                <Text className='font-medium'>Take Photo</Text>
              </Button>

              <Button onPress={pickFromLibrary} variant='outline' className='w-full justify-start gap-3'>
                <Icon as={ImageIcon} size={20} />
                <Text className='font-medium'>Choose from Gallery</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
