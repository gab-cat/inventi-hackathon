import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  type: 'root' | 'back';
  icon?: keyof typeof Ionicons.glyphMap;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, type, icon, rightSlot, className = '' }: PageHeaderProps) {
  return (
    <View
      className={`pt-12 px-5 pb-5 bg-white rounded-b-3xl ${className} shadow-2xl shadow-blue-800/20 border-b border-x border-blue-800/20`}
    >
      <View className='flex-row justify-between items-center'>
        {/* Left side: Icon (root) or Back button (back) */}
        {type === 'root' ? (
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-2xl bg-blue-800/20 items-center justify-center'>
              <Ionicons size={28} name={icon || 'home'} color='#1e40af' />
            </View>
            <View>
              <Text className='text-lg font-bold text-blue-800 tracking-tight'>{title}</Text>
              {subtitle && <Text className='text-sm text-blue-800/80 mt-0.5'>{subtitle}</Text>}
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <View className='flex-row items-center gap-2 bg-blue-800/15 border border-blue-800/25 rounded-lg px-3 py-2'>
              <Icon as={ArrowLeft} size={16} className='text-blue-800' />
            </View>
          </TouchableOpacity>
        )}

        {/* Center content for back type headers */}
        {type === 'back' && (
          <View className='flex-1 ml-4'>
            <Text className='text-lg font-bold text-blue-800 tracking-tight'>{title}</Text>
            {subtitle && <Text className='text-sm text-blue-800/80 mt-0.5'>{subtitle}</Text>}
          </View>
        )}

        {/* Right slot for optional buttons/actions */}
        {rightSlot && <View className='ml-4'>{rightSlot}</View>}
      </View>
    </View>
  );
}
