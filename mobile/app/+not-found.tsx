import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, Home, Compass } from 'lucide-react-native';
import { ThemedView } from '@/components/themed-view';
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
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated 404 Icon */}
        <Animated.View style={{ transform: [{ translateY: bounce }] }}>
          <View style={styles.iconContainer}>
            <Compass size={80} color='#6366f1' />
            <View style={styles.questionMark}>
              <Text style={styles.questionMarkText}>?</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Title */}
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>

        {/* Friendly Message */}
        <Text style={styles.message}>
          Looks like you&apos;ve ventured into uncharted territory! The page you&apos;re looking for doesn&apos;t exist.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Link href='/' asChild>
            <Pressable>
              <Button
                variant='default'
                size='lg'
                className='flex-row items-center gap-2 bg-primary active:bg-primary/90'
              >
                <Home size={20} color='white' />
                <Text style={styles.buttonText}>Go Home</Text>
              </Button>
            </Pressable>
          </Link>

          <Link href='/(tabs)/explore' asChild>
            <Pressable>
              <Button variant='outline' size='lg' className='flex-row items-center gap-2 mt-3'>
                <MapPin size={20} color='#374151' />
                <Text style={styles.outlineButtonText}>Explore</Text>
              </Button>
            </Pressable>
          </Link>
        </View>

        {/* Fun Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>&ldquo;Not all those who wander are lost.&rdquo;</Text>
          <Text style={styles.footerSubtext}>&mdash; J.R.R. Tolkien</Text>
        </View>
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
    position: 'relative',
    marginBottom: 32,
  },
  questionMark: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  questionMarkText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 320,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 250,
    marginBottom: 40,
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
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
  },
});
