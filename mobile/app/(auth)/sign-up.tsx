import React from 'react';
import { View, Text } from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { AuthCard } from '@/components/ui/AuthCard';
import { TextField } from '@/components/ui/TextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
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
      <View style={{ flex: 1, padding: 24, backgroundColor: isDark ? '#0b0d12' : '#f8fafc' }}>
        <View style={{ alignItems: 'center', marginTop: 36 }}>
          <AuthCard title='Check your inbox' subtitle='We sent a 6-digit code to verify your email'>
            <View style={{ gap: 12 }}>
              <TextField
                label='Verification code'
                value={code}
                placeholder='123456'
                keyboardType='number-pad'
                onChangeText={setCode}
              />
              <PrimaryButton title={verifying ? 'Verifying…' : 'Verify'} onPress={onVerifyPress} loading={verifying} />
            </View>
          </AuthCard>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ height: 140, position: 'relative' }}>
          <View
            style={{
              position: 'absolute',
              bottom: -40,
              left: -20,
              width: 160,
              height: 160,
              backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
              borderRadius: 9999,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -60,
              right: -30,
              width: 220,
              height: 220,
              backgroundColor: isDark ? '#1f2937' : '#cbd5e1',
              borderRadius: 9999,
              opacity: 0.35,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16, backgroundColor: isDark ? '#0b0d12' : '#f8fafc' }}>
      <View style={{ alignItems: 'center', marginTop: 36 }}>
        <AuthCard title='Create account' subtitle='Start your journey with us'>
          <View style={{ gap: 12 }}>
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
            <PrimaryButton title={loading ? 'Creating…' : 'Continue'} onPress={onSignUpPress} loading={loading} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }}>Already have an account?</Text>
              <Link href='/sign-in'>
                <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: '700' }}>Sign in</Text>
              </Link>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 10, color: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }} />
            </View>
            <PrimaryButton
              title='Continue with Google'
              onPress={async () => {
                try {
                  const { createdSessionId, setActive: setActiveFromSSO } = await startSSOFlow({
                    strategy: 'oauth_google',
                  });
                  if (createdSessionId) {
                    await setActiveFromSSO?.({ session: createdSessionId });
                    // Navigate safely with error handling
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
              style={{ backgroundColor: isDark ? '#ea4335' : '#ea4335' }}
            />
          </View>
        </AuthCard>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ height: 140, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            bottom: -40,
            left: -20,
            width: 160,
            height: 160,
            backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
            borderRadius: 9999,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -60,
            right: -30,
            width: 220,
            height: 220,
            backgroundColor: isDark ? '#1f2937' : '#cbd5e1',
            borderRadius: 9999,
            opacity: 0.35,
          }}
        />
      </View>
    </View>
  );
}
