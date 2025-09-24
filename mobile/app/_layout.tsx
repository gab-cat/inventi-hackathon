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
import { NotificationProvider } from '@/providers/notification.provider';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi.config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit, AppKit } from '@reown/appkit-wagmi-react-native';
import { mainnet } from 'wagmi/chains';

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

const queryClient = new QueryClient();

// Get projectId from environment variables
const projectId = 'c3fb583cd2e0ae4545793ac477582e2a';

// Metadata for the app
const metadata = {
  name: 'Inventi App',
  description: 'Inventi Property Management System',
  url: 'https://inventi.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'inventi://',
    universal: 'https://inventi.app',
  },
};

// Initialize AppKit - moved to avoid module timing issues
let appKitInitialized = false;

function initializeAppKit() {
  if (!appKitInitialized) {
    try {
      createAppKit({
        projectId,
        metadata,
        wagmiConfig: config,
        defaultChain: mainnet,
        enableAnalytics: true,
        features: {
          email: true, // Enable email login
          socials: ['google', 'x', 'discord'] as any, // Enable social login platforms
          emailShowWallets: true, // Show wallet options on connect screen
        },
      });
      appKitInitialized = true;
      console.log('AppKit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AppKit:', error);
    }
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize AppKit when component mounts
  useEffect(() => {
    initializeAppKit();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
              <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <NotificationProvider>
                  <AppInitializer />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='(auth)' options={{ headerShown: false }} />
                    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                    <Stack.Screen name='(tech)' options={{ headerShown: false }} />
                    <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
                  <PortalHost name='root' />
                  <StatusBar style='auto' />
                  <AppKit />
                </NotificationProvider>
              </ConvexProviderWithClerk>
            </ClerkProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
