import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { RoundedHapticTab } from '@/components/rounded-haptic-tab';
import { useAuth } from '@clerk/clerk-expo';

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href='/(auth)/sign-in' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e40af', // blue-800 for focused tab
        tabBarInactiveTintColor: '#333333', // blue-500 for unfocused tabs
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // white background for tab bar
          borderTopWidth: 0,
          elevation: 8, // shadow on Android
          shadowOpacity: 0.1, // shadow on iOS
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          shadowColor: '#000000',
          paddingBottom: 0,
          paddingTop: 0,
          paddingHorizontal: 12,
          height: 70,
          borderRadius: 32,
          marginHorizontal: 16,
          marginBottom: 8,
          position: 'absolute',
        },
        headerShown: false,
        tabBarButton: RoundedHapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons size={focused ? 28 : 24} name='home' color={color} />,
        }}
      />
      <Tabs.Screen
        name='services'
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => <Ionicons size={focused ? 28 : 24} name='grid' color={color} />,
        }}
      />
      <Tabs.Screen
        name='properties'
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, focused }) => <Ionicons size={focused ? 28 : 24} name='business' color={color} />,
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Ionicons size={focused ? 28 : 24} name='settings' color={color} />,
        }}
      />
    </Tabs>
  );
}
