import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@clerk/clerk-expo';

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href='/(auth)/sign-in' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF', // white for selected icon
        tabBarInactiveTintColor: '#FFFFFF', // white for unselected icons
        tabBarActiveBackgroundColor: '#1E40AF', // blue-800 background for selected tab
        tabBarInactiveBackgroundColor: '#1E40AF', // blue-800 background for unselected tabs
        tabBarStyle: {
          backgroundColor: '#1E40AF', // blue-800 background for entire tab bar
          borderTopWidth: 0, // remove any border
          elevation: 0, // remove shadow on Android
          shadowOpacity: 0, // remove shadow on iOS
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='home' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='services'
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='grid' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='properties'
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='business' color={focused ? color : color + '80'} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 28 : 24} name='settings' color={focused ? color : color + '80'} />
          ),
        }}
      />
    </Tabs>
  );
}
