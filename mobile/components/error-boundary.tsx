import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorPage error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorPageProps {
  error?: Error;
  onReset: () => void;
}

export function ErrorPage({ error, onReset }: ErrorPageProps) {
  return (
    <View className='flex-1 bg-background items-center justify-center p-6'>
      <View className='items-center mb-8'>
        <AlertTriangle size={80} className='text-destructive mb-4' />
        <Text className='text-4xl font-bold text-foreground mb-2'>Oops!</Text>
        <Text className='text-xl font-semibold text-muted-foreground mb-4'>Something went wrong</Text>
        <Text className='text-base text-muted-foreground text-center mb-6 max-w-xs'>
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </Text>

        {error && (
          <View className='bg-muted p-4 rounded-lg mb-6 max-w-xs'>
            <Text className='text-sm text-muted-foreground font-mono'>{error.message}</Text>
          </View>
        )}
      </View>

      <View className='w-full max-w-xs'>
        <Pressable
          onPress={onReset}
          className='bg-primary active:bg-primary/90 py-4 px-6 rounded-lg flex-row items-center justify-center'
        >
          <RefreshCw size={20} className='text-primary-foreground mr-2' />
          <Text className='text-primary-foreground font-semibold text-base'>Try Again</Text>
        </Pressable>
      </View>

      <View className='mt-8 items-center'>
        <Text className='text-sm text-muted-foreground'>&quot;In the middle of difficulty lies opportunity.&quot;</Text>
        <Text className='text-xs text-muted-foreground mt-1'>— Albert Einstein</Text>
      </View>
    </View>
  );
}
