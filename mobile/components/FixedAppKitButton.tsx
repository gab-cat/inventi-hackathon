import React, { useCallback } from 'react';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { ModalController } from '@reown/appkit-core-react-native';
import { TouchableOpacity, Text, View } from 'react-native';

interface FixedAppKitButtonProps {
  fallbackButton?: boolean;
  style?: any;
}

/**
 * Enhanced AppKitButton with workaround for modal loading issues
 * If the original AppKitButton doesn't work, this provides a fallback
 */
export function FixedAppKitButton({ fallbackButton = false, style }: FixedAppKitButtonProps) {
  const forceOpenModal = useCallback(() => {
    try {
      // Force close first, then open to reset state
      ModalController.close();
      setTimeout(() => {
        ModalController.open();
      }, 100);
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }, []);

  if (fallbackButton) {
    return (
      <TouchableOpacity
        onPress={forceOpenModal}
        style={[
          {
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Connect Wallet</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
      <AppKitButton />
      {/* Hidden debug button - only visible in development */}
      {__DEV__ && (
        <TouchableOpacity
          onPress={forceOpenModal}
          style={{
            position: 'absolute',
            right: -100,
            top: 0,
            backgroundColor: 'red',
            padding: 5,
            borderRadius: 3,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>Force Open</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
