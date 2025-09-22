import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PortalHost } from '@rn-primitives/portal';
import { ErrorBoundary } from '@/components/error-boundary';
import { usePropertyStore } from '@/stores/user.store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl!, {
  unsavedChangesWarning: false,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  // Fail fast during development to make missing env obvious
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

function AppInitializer() {
  const { initializeStore, isInitialized } = usePropertyStore();
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  useEffect(() => {
    const initStore = async () => {
      try {
        await initializeStore();
      } catch (error) {
        console.error('Failed to initialize store:', error);
      } finally {
        setIsStoreLoading(false);
      }
    };

    initStore();
  }, [initializeStore]);

  // Show loading screen while initializing store
  if (!isInitialized || isStoreLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#007AFF' />
      </View>
    );
  }

  return null; // This component only handles initialization
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <AppInitializer />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name='(auth)' options={{ headerShown: false }} />
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen name='(tech)' options={{ headerShown: false }} />
              <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <PortalHost name='root' />
            <StatusBar style='auto' />
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
