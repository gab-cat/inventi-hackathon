
import { Stack } from 'expo-router';

export default function AuthLayout() {

  return (
    <Stack screenOptions={{        
      headerShown: false,
      title: '',
    }}>
      <Stack.Screen name="sign-in" options={{ title: 'Sign in', headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account', headerShown: false }} />
    </Stack>
  );
}

