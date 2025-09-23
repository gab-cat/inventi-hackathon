import React from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, Home, Compass } from 'lucide-react-native';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, bounceAnim]);

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -10, 0],
  });

  return (
    <View className='flex-1 bg-background'>
      <Animated.View
        className='flex-1 justify-center items-center px-6 py-10'
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Animated 404 Icon */}
        <Animated.View style={{ transform: [{ translateY: bounce }] }}>
          <View className='relative mb-8'>
            <Compass size={80} className='text-primary' />
            <View className='absolute -top-1 -right-1 bg-amber-500 rounded-full w-7 h-7 items-center justify-center shadow-lg'>
              <Text className='text-white text-lg font-bold'>?</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Title */}
        <Text className='text-7xl font-bold text-foreground text-center mb-2'>404</Text>
        <Text className='text-2xl font-semibold text-muted-foreground text-center mb-6'>Page Not Found</Text>

        {/* Friendly Message */}
        <Text className='text-base text-muted-foreground text-center leading-6 mb-10 max-w-xs'>
          Looks like you&apos;ve ventured into uncharted territory! The page you&apos;re looking for doesn&apos;t exist.
        </Text>

        {/* Action Buttons */}
        <View className='w-full max-w-xs mb-10'>
          <Link href='/' asChild>
            <Pressable>
              <Button className='flex-row items-center justify-center gap-2 bg-primary active:bg-primary/90 py-4 px-6 rounded-lg mb-3'>
                <Home size={20} className='text-primary-foreground' />
                <Text className='text-primary-foreground font-semibold text-base'>Go Home</Text>
              </Button>
            </Pressable>
          </Link>

          <Link href='/(tabs)/services' asChild>
            <Pressable>
              <Button
                variant='outline'
                className='flex-row items-center justify-center gap-2 py-4 px-6 rounded-lg border border-border'
              >
                <MapPin size={20} className='text-foreground' />
                <Text className='text-foreground font-semibold text-base'>Services</Text>
              </Button>
            </Pressable>
          </Link>
        </View>

        {/* Fun Footer */}
        <View className='items-center pt-5'>
          <Text className='text-base text-muted-foreground text-center italic mb-1'>
            &ldquo;Not all those who wander are lost.&rdquo;
          </Text>
          <Text className='text-sm text-muted-foreground text-center'>&mdash; J.R.R. Tolkien</Text>
        </View>
      </Animated.View>
    </View>
  );
}
