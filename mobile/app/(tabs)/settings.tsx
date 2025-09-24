import React from 'react';
import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PageHeader } from '@/components/ui/page-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Check user role for tech access
  const userData = useQuery(api.user.getCurrentUser);
  const isFieldTechnician =
    userData && 'success' in userData && userData.success && userData.user?.role === 'field_technician';

  const handleTechAccess = () => {
    router.replace('/tech/dashboard');
  };

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
      <PageHeader title='Settings' subtitle='Manage your account and preferences' type='root' icon='settings' />

      {/* Profile Section */}
      <ThemedView className='bg-white dark:bg-gray-800 p-6  border-gray-200 dark:border-gray-700'>
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
      <ThemedView className='bg-white dark:bg-gray-800  p-6   border-gray-200 dark:border-gray-700'>
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

          {/* Tech Access - Only show for field technicians */}
          {isFieldTechnician && (
            <TouchableOpacity
              onPress={handleTechAccess}
              className='flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700'
            >
              <Ionicons name='construct' size={20} color='#7c3aed' className='mr-3' />
              <ThemedView className='flex-1'>
                <Text className='text-base text-purple-600 dark:text-purple-400'>Field Technician</Text>
                <Text className='text-sm text-gray-600 dark:text-gray-400'>Access technician tools and dashboard</Text>
              </ThemedView>
              <Ionicons name='chevron-forward' size={20} color='#7c3aed' />
            </TouchableOpacity>
          )}

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
      <ThemedView className='bg-white dark:bg-gray-800 p-6  border-gray-200 dark:border-gray-700'>
        <Text className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4'>App Information</Text>

        <ThemedView className='space-y-3'>
          <ThemedView className='flex-row justify-between items-center py-2'>
            <Text className='text-xs text-gray-600 dark:text-gray-400'>Version</Text>
            <Text className='text-xs text-gray-800 dark:text-gray-200'>1.0.0</Text>
          </ThemedView>

          <ThemedView className='flex-row justify-between items-center py-2'>
            <Text className='text-xs text-gray-600 dark:text-gray-400'>Build</Text>
            <Text className='text-xs text-gray-800 dark:text-gray-200'>2024.09.17</Text>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Sign Out Button */}
      <PrimaryButton
        title='Sign Out'
        onPress={handleSignOut}
        style={{
          backgroundColor: '#ef4444',
        }}
      />

      {/* Footer */}
      <ThemedView className='items-center py-4 !bg-gray-50'>
        <Text className='text-xs text-gray-500 text-center'>Inventi Property Management System</Text>
        <Text className='text-xs text-gray-500 text-center mt-1'>© 2024 All rights reserved</Text>
      </ThemedView>
    </ScrollView>
  );
}
