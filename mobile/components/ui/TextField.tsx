import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = TextInputProps & {
  label?: string;
  errorText?: string;
};

export function TextField({ label, errorText, style, ...props }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const borderColor = errorText ? '#ef4444' : isDark ? '#2f3340' : '#e5e7eb';
  const backgroundColor = isDark ? '#0b0d12' : '#fafafa';
  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const labelColor = isDark ? '#94a3b8' : '#334155';

  return (
    <View style={{ width: '100%' }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontSize: 13, color: labelColor, fontWeight: '600' }}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
        style={[
          {
            width: '100%',
            borderWidth: 1,
            borderColor,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor,
            color: textColor,
          },
          style,
        ]}
        {...props}
      />
      {errorText ? (
        <Text style={{ marginTop: 6, color: '#ef4444', fontSize: 12 }}>{errorText}</Text>
      ) : null}
    </View>
  );
}


