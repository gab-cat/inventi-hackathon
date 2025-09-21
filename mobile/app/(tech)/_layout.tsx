import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@clerk/clerk-expo';
import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AlertTriangle } from 'lucide-react-native';

export default function TechTabLayout() {
  const { isSignedIn } = useAuth();

  // Check user role
  const userData = useQuery(api.user.getCurrentUser);
  const isLoading = userData === undefined;
  const isFieldTechnician =
    userData && 'success' in userData && userData.success && userData.user?.role === 'field_technician';

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1 }} className='items-center justify-center'>
        <Text>Loading...</Text>
      </ThemedView>
    );
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    return <Redirect href='/(auth)/sign-in' />;
  }

  // Redirect if not a field technician
  if (!isFieldTechnician) {
    return (
      <ThemedView style={{ flex: 1 }} className='items-center justify-center px-8'>
        <View className='items-center mb-8'>
          <View className='w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4'>
            <Icon as={AlertTriangle} size={40} className='text-red-600' />
          </View>
          <Text className='text-2xl font-bold text-center mb-2'>Access Denied</Text>
          <Text className='text-muted-foreground text-center'>
            This area is restricted to field technicians only. Please contact your administrator if you believe this is
            an error.
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF', // white for selected icon
        tabBarInactiveTintColor: '#FFFFFF', // white for unselected icons
        tabBarActiveBackgroundColor: '#7C3AED', // purple-600 background for selected tab
        tabBarInactiveBackgroundColor: '#7C3AED', // purple-600 background for unselected tabs
        tabBarStyle: {
          backgroundColor: '#7C3AED', // purple-600 background for entire tab bar
          borderTopWidth: 0, // remove any border
          elevation: 0, // remove shadow on Android
          shadowOpacity: 0, // remove shadow on iOS
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='dashboard'
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='home' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='maintenance-requests'
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='construct' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='asset-inventory'
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='cube' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='asset-checkout'
        options={{
          title: 'Checkout',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='scan' color={focused ? color : color + '80'} />
          ),
        }}
      />
    </Tabs>
  );
}
