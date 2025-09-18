import React, { useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export default function QRScanner({ onScan, onClose, title = 'Scan QR Code' }: QRScannerProps) {
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setScanned(true);
    Alert.alert('QR Code Scanned', `Scanned data: ${result.data}`, [
      {
        text: 'Use This Code',
        onPress: () => {
          onScan(result.data);
          onClose();
        },
      },
      {
        text: 'Scan Again',
        onPress: () => setScanned(false),
        style: 'cancel',
      },
    ]);
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View className='flex-1 justify-center items-center bg-black'>
        <Text className='text-white'>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className='flex-1 justify-center items-center bg-black p-6'>
        <Text className='text-white text-center mb-4'>
          We need your permission to access the camera for scanning QR codes.
        </Text>
        <View className='gap-3 w-full'>
          <Button onPress={requestPermission} className='w-full'>
            <Text>Grant Permission</Text>
          </Button>
          <Button onPress={onClose} variant='outline' className='w-full'>
            <Text>Go Back</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-black'>
      {/* Header */}
      <View className='flex-row justify-between items-center p-4 bg-black/80'>
        <Text className='text-white text-lg font-semibold'>{title}</Text>
        <TouchableOpacity onPress={onClose} className='p-2'>
          <Icon as={X} size={24} className='text-white' />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing='back'
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code93', 'code128', 'itf14'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View className='flex-1 justify-center items-center'>
        <View className='w-64 h-64 border-2 border-white rounded-lg'>
          <View className='absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-blue-400' />
          <View className='absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-blue-400' />
          <View className='absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-blue-400' />
          <View className='absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-blue-400' />
        </View>

        <Text className='text-white text-center mt-4 px-6'>Position QR code or barcode within the frame</Text>
      </View>

      {/* Bottom Controls */}
      <View className='p-6 bg-black/80'>
        <View className='flex-row justify-center gap-4'>
          <TouchableOpacity onPress={toggleTorch} className='p-3 bg-white/20 rounded-full'>
            <Icon as={torchOn ? FlashlightOff : Flashlight} size={24} className='text-white' />
          </TouchableOpacity>
        </View>

        {scanned && (
          <View className='mt-4'>
            <Button onPress={() => setScanned(false)}>
              <Text>Tap to Scan Again</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
