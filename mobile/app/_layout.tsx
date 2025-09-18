import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PortalHost } from '@rn-primitives/portal';
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';

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

// Global Error Boundary Component
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRetry = async () => {
    // Add haptic feedback and animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await retry();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Animated Error Icon */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={80} color='#ef4444' />
          </View>
        </Animated.View>

        {/* Error Title */}
        <Text style={styles.title}>Oops! Something went wrong</Text>

        {/* Error Message */}
        <Text style={styles.message}>
          We encountered an unexpected error. Don&apos;t worry, our team has been notified.
        </Text>

        {/* Error Details (collapsible in production) */}
        {__DEV__ && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            <Text style={styles.errorStack}>{error.stack}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant='default'
            size='lg'
            onPress={handleRetry}
            className='flex-row items-center gap-2 bg-primary active:bg-primary/90'
          >
            <RefreshCw size={20} color='white' />
            <Text style={styles.buttonText}>Try Again</Text>
          </Button>

          <Button variant='outline' size='lg' onPress={handleGoHome} className='flex-row items-center gap-2 mt-3'>
            <Home size={20} color='#374151' />
            <Text style={styles.outlineButtonText}>Go Home</Text>
          </Button>
        </View>

        {/* Fun Footer Message */}
        <Text style={styles.footer}>If this keeps happening, please contact support.</Text>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(var(--background))',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  errorDetails: {
    backgroundColor: 'hsl(var(--muted))',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    maxWidth: 350,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'hsl(var(--foreground))',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    color: 'hsl(var(--muted-foreground))',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 250,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    color: 'hsl(var(--foreground))',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
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
  );
}
