import React from 'react';
import { View, Text, ScrollView, Alert, Image } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#0b0d12' : '#f8fafc' }}>
      {/* Header */}
      <View className='pt-16 px-5 pb-5 bg-blue-800 rounded-b-[20px]'>
        <View className='flex-row justify-between items-center'>
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-xl bg-white/20 items-center justify-center'>
              <Ionicons name='settings' size={28} color='white' />
            </View>
            <View>
              <Text className='text-3xl font-bold text-white tracking-tight'>Settings</Text>
              <Text className='text-sm text-white/80 mt-0.5'>Manage your account and preferences</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Section */}
      <ThemedView className='bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700'>
        <ThemedView className='items-center mb-6'>
          <View className='w-20 h-20 bg-blue-800 rounded-full items-center justify-center mb-4'>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className='w-full h-full rounded-full' resizeMode='cover' />
            ) : (
              <Ionicons name='person' size={32} color='white' />
            )}
          </View>
          <Text className='text-xl font-semibold text-blue-800 mb-1'>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className='text-sm text-gray-600 dark:text-gray-400'>{user?.emailAddresses[0]?.emailAddress}</Text>
        </ThemedView>

        {/* Profile Details */}
        <ThemedView className='space-y-4'>
          <ThemedView className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'>
            <Ionicons name='mail' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Email</Text>
              <Text className='text-base text-gray-800 dark:text-gray-200'>
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </ThemedView>
          </ThemedView>

          <ThemedView className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'>
            <Ionicons name='person' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Name</Text>
              <Text className='text-base text-gray-800 dark:text-gray-200'>
                {user?.firstName} {user?.lastName}
              </Text>
            </ThemedView>
          </ThemedView>

          <ThemedView className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'>
            <Ionicons name='calendar' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Member since</Text>
              <Text className='text-base text-gray-800 dark:text-gray-200'>
                {user?.createdAt ? formatDate(new Date(user.createdAt)) : 'N/A'}
              </Text>
            </ThemedView>
          </ThemedView>

          <ThemedView className='flex-row items-center py-3'>
            <Ionicons name='time' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Last sign in</Text>
              <Text className='text-base text-gray-800 dark:text-gray-200'>
                {user?.lastSignInAt ? formatDate(new Date(user.lastSignInAt)) : 'N/A'}
              </Text>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Account Actions */}
      <ThemedView className='bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700'>
        <Text className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4'>Account Actions</Text>

        <ThemedView className='space-y-3'>
          <ThemedView className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'>
            <Ionicons name='notifications' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-base text-gray-800 dark:text-gray-200'>Notifications</Text>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Manage notification preferences</Text>
            </ThemedView>
            <Ionicons name='chevron-forward' size={20} color={isDark ? '#94a3b8' : '#6b7280'} />
          </ThemedView>

          <ThemedView className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'>
            <Ionicons name='shield-checkmark' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-base text-gray-800 dark:text-gray-200'>Privacy & Security</Text>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Manage your privacy settings</Text>
            </ThemedView>
            <Ionicons name='chevron-forward' size={20} color={isDark ? '#94a3b8' : '#6b7280'} />
          </ThemedView>

          <ThemedView className='flex-row items-center py-3'>
            <Ionicons name='help-circle' size={20} color={isDark ? '#94a3b8' : '#6b7280'} className='mr-3' />
            <ThemedView className='flex-1'>
              <Text className='text-base text-gray-800 dark:text-gray-200'>Help & Support</Text>
              <Text className='text-sm text-gray-600 dark:text-gray-400'>Get help and contact support</Text>
            </ThemedView>
            <Ionicons name='chevron-forward' size={20} color={isDark ? '#94a3b8' : '#6b7280'} />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* App Info */}
      <ThemedView className='bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700'>
        <Text className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4'>App Information</Text>

        <ThemedView className='space-y-3'>
          <ThemedView className='flex-row justify-between items-center py-2'>
            <Text className='text-base text-gray-600 dark:text-gray-400'>Version</Text>
            <Text className='text-base text-gray-800 dark:text-gray-200'>1.0.0</Text>
          </ThemedView>

          <ThemedView className='flex-row justify-between items-center py-2'>
            <Text className='text-base text-gray-600 dark:text-gray-400'>Build</Text>
            <Text className='text-base text-gray-800 dark:text-gray-200'>2024.09.17</Text>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Sign Out Button */}
      <PrimaryButton
        title='Sign Out'
        onPress={handleSignOut}
        style={{
          backgroundColor: '#ef4444',
          marginBottom: 32,
        }}
      />

      {/* Footer */}
      <ThemedView className='items-center py-4'>
        <Text className='text-xs text-gray-500 text-center'>Inventi Property Management System</Text>
        <Text className='text-xs text-gray-500 text-center mt-1'>© 2024 All rights reserved</Text>
      </ThemedView>
    </ScrollView>
  );
}
