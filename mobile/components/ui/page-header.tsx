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
    <View className={`pt-12 px-5 pb-5 bg-blue-800 rounded-b-[20px] ${className}`}>
      <View className='flex-row justify-between items-center'>
        {/* Left side: Icon (root) or Back button (back) */}
        {type === 'root' ? (
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-xl bg-white/20 items-center justify-center'>
              <Ionicons size={28} name={icon || 'home'} color='#FFFFFF' />
            </View>
            <View>
              <Text className='text-lg font-bold text-white tracking-tight'>{title}</Text>
              {subtitle && <Text className='text-sm text-white/80 mt-0.5'>{subtitle}</Text>}
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <View className='flex-row items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-2'>
              <Icon as={ArrowLeft} size={16} className='text-white' />
              <Text className='text-white text-sm font-medium'>Back</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Center content for back type headers */}
        {type === 'back' && (
          <View className='flex-1 ml-4'>
            <Text className='text-lg font-bold text-white tracking-tight'>{title}</Text>
            {subtitle && <Text className='text-sm text-white/80 mt-0.5'>{subtitle}</Text>}
          </View>
        )}

        {/* Right slot for optional buttons/actions */}
        {rightSlot && <View className='ml-4'>{rightSlot}</View>}
      </View>
    </View>
  );
}
