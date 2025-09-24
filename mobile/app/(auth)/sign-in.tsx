import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth, useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '@/components/ui/TextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PageHeader } from '@/components/ui/page-header';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.user.getCurrentUser, isSignedIn ? {} : 'skip');

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  // Navigate to home only when user is signed in and router is ready
  React.useEffect(() => {
    if (isSignedIn && router && currentUser?.success) {
      // Add a small delay to ensure the layout is fully mounted
      const timer = setTimeout(() => {
        try {
          router.replace(currentUser.user?.role === 'field_technician' ? '/tech/dashboard' : '/');
        } catch (error) {
          console.warn('Navigation failed, user may already be on the correct screen:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, router, currentUser]);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        // Navigate safely with error handling
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (error) {
            console.warn('Navigation after sign in failed:', error);
          }
        }, 100);
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onGooglePress = async () => {
    try {
      setGoogleLoading(true);
      const { createdSessionId, setActive: setActiveFromSSO } = await startSSOFlow({ strategy: 'oauth_google' });
      if (createdSessionId) {
        await setActiveFromSSO?.({ session: createdSessionId });
        // Navigate safely with error handling
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (error) {
            console.warn('Navigation after Google sign in failed:', error);
          }
        }, 100);
        return;
      }
    } catch (err) {
      console.error('Google OAuth error', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader title='Welcome Back' subtitle='Sign in to your account' type='root' icon='log-in' className='mb-6' />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign In Form */}
        <View className='bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100'>
          <View className='space-y-4'>
            <TextField
              label='Email Address'
              autoCapitalize='none'
              keyboardType='email-address'
              autoComplete='email'
              value={emailAddress}
              placeholder='Enter your email address'
              onChangeText={setEmailAddress}
            />

            <TextField
              label='Password'
              value={password}
              placeholder='Enter your password'
              secureTextEntry
              autoComplete='password'
              onChangeText={setPassword}
            />

            <PrimaryButton
              title={loading ? 'Signing in…' : 'Sign In'}
              onPress={onSignInPress}
              loading={loading}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>

        {/* Divider */}
        <View className='flex-row items-center my-4'>
          <View className='flex-1 h-px bg-gray-200' />
          <Text className='px-4 text-sm text-gray-500'>or</Text>
          <View className='flex-1 h-px bg-gray-200' />
        </View>

        {/* Google Sign In */}
        <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100'>
          <TouchableOpacity
            onPress={googleLoading ? undefined : onGooglePress}
            className={`flex-row items-center justify-center gap-3 rounded-xl py-4 px-4 ${
              googleLoading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            {googleLoading ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <Ionicons name='logo-google' size={20} color='white' />
            )}
            <Text className='text-white text-base font-semibold'>
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className='bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100'>
          <View className='items-center'>
            <Text className='text-gray-600 text-center'>
              Don&apos;t have an account?{' '}
              <Link href='/sign-up'>
                <Text className='text-blue-800 font-semibold'>Sign up here</Text>
              </Link>
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className='items-center py-8'>
          <Text className='text-xs text-gray-500 text-center mb-1'>Inventi Property Management System</Text>
          <Text className='text-xs text-gray-500 text-center'>Secure sign-in powered by Clerk</Text>
        </View>
      </ScrollView>
    </View>
  );
}
