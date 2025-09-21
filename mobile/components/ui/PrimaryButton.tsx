import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, loading, disabled, style }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = disabled ? (isDark ? '#1f2937' : '#cbd5e1') : isDark ? '#4f46e5' : '#111827';
  const fg = isDark ? '#e5e7eb' : '#ffffff';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          width: '100%',
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}


