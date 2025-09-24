import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { TextField } from '@/components/ui/TextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PageHeader } from '@/components/ui/page-header';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      setVerifying(true);
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        // Navigate safely with error handling
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (error) {
            console.warn('Navigation after sign up verification failed:', error);
          }
        }, 100);
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setVerifying(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className='flex-1 bg-gray-50'>
        <PageHeader
          title='Check Your Inbox'
          subtitle='We sent a 6-digit code to verify your email'
          type='root'
          icon='mail'
          className='mb-6'
        />

        <View style={{ flex: 1, padding: 20, paddingTop: 0 }}>
          {/* Verification Form */}
          <View className='bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100'>
            <View className='space-y-4'>
              <TextField
                label='Verification code'
                value={code}
                placeholder='123456'
                keyboardType='number-pad'
                onChangeText={setCode}
              />
              <PrimaryButton
                title={verifying ? 'Verifying…' : 'Verify'}
                onPress={onVerifyPress}
                loading={verifying}
                style={{ marginTop: 12 }}
              />
            </View>
          </View>

          {/* Footer */}
          <View className='items-center py-8'>
            <Text className='text-xs text-gray-500 text-center mb-1'>Inventi Property Management System</Text>
            <Text className='text-xs text-gray-500 text-center'>Secure verification powered by Clerk</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader
        title='Create Account'
        subtitle='Start your journey with us'
        type='root'
        icon='person-add'
        className='mb-6'
      />

      <View style={{ flex: 1, padding: 20, paddingTop: 0 }}>
        {/* Sign Up Form */}
        <View className='bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100'>
          <View className='space-y-4'>
            <TextField
              label='Email'
              autoCapitalize='none'
              keyboardType='email-address'
              autoComplete='email'
              value={emailAddress}
              placeholder='you@example.com'
              onChangeText={setEmailAddress}
            />
            <TextField
              label='Password'
              value={password}
              placeholder='••••••••'
              secureTextEntry
              autoComplete='password-new'
              onChangeText={setPassword}
            />
            <PrimaryButton
              title={loading ? 'Creating…' : 'Continue'}
              onPress={onSignUpPress}
              loading={loading}
              style={{ marginTop: 12 }}
            />

            {/* Sign In Link */}
            <View className='flex-row justify-center items-center mt-4'>
              <Text className='text-gray-600 text-sm'>Already have an account?</Text>
              <Link href='/sign-in'>
                <Text className='text-blue-800 font-semibold text-sm ml-1'>Sign in</Text>
              </Link>
            </View>

            {/* Divider */}
            <View className='flex-row items-center my-4'>
              <View className='flex-1 h-px bg-gray-200' />
              <Text className='px-4 text-sm text-gray-500'>or</Text>
              <View className='flex-1 h-px bg-gray-200' />
            </View>

            {/* Google Sign Up */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  const { createdSessionId, setActive: setActiveFromSSO } = await startSSOFlow({
                    strategy: 'oauth_google',
                  });
                  if (createdSessionId) {
                    await setActiveFromSSO?.({ session: createdSessionId });
                    setTimeout(() => {
                      try {
                        router.replace('/');
                      } catch (error) {
                        console.warn('Navigation after Google sign up failed:', error);
                      }
                    }, 100);
                  }
                } catch (err) {
                  console.error('Google SSO error', err);
                }
              }}
              className='flex-row items-center justify-center gap-3 rounded-xl py-4 px-4 bg-blue-600'
            >
              <Text className='text-white text-base font-semibold'>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className='items-center py-8'>
          <Text className='text-xs text-gray-500 text-center mb-1'>Inventi Property Management System</Text>
          <Text className='text-xs text-gray-500 text-center'>Secure sign-up powered by Clerk</Text>
        </View>
      </View>
    </View>
  );
}
