import React from 'react';
import { View, Text, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  logoSource?: ImageSourcePropType;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AuthCard({ title, subtitle, logoSource, children, style }: AuthCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        {
          width: '90%',
          maxWidth: 420,
          borderRadius: 16,
          padding: 20,
          backgroundColor: isDark ? '#111318' : '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        },
        style,
      ]}
    >
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        {logoSource ? (
          <Image source={logoSource} style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 8 }} />
        ) : null}
        <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#f5f7fb' : '#0f172a' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 6, fontSize: 14, color: isDark ? '#94a3b8' : '#475569', textAlign: 'center' }}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}


