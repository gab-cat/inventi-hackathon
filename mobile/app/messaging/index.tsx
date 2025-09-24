import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, TouchableOpacity, View, Text } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Id } from '@convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type ChatThread = {
  _id: Id<'chatThreads'>;
  threadType: string;
  title?: string;
  lastMessageAt?: number;
  isArchived: boolean;
  priority?: string;
  createdAt: number;
  lastMessage?: {
    content: string;
    messageType: string;
    senderId: Id<'users'>;
    createdAt: number;
  };
  unreadCount: number;
  otherParticipants: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  }[];
};

export default function MessagingScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch chat threads
  const chatThreadsData = useQuery(api.messages.mobileGetChatThreads, {
    limit: 50,
  });

  // Start chat with manager mutation
  const startChatWithManager = useMutation(api.messages.mobileStartChatWithManager);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleStartChat = async () => {
    try {
      // For now, we'll use a hardcoded property ID. In a real app, this would come from user context
      const propertyId = 'placeholder-property-id' as Id<'properties'>;

      const result = await startChatWithManager({
        propertyId,
        initialMessage: 'Hello, I would like to start a conversation with you.',
      });

      if (result.success && result.threadId) {
        router.push(`/messaging/${result.threadId}`);
      } else {
        Alert.alert('Error', result.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleThreadPress = (threadId: Id<'chatThreads'>) => {
    router.push(`/messaging/${threadId}`);
  };

  const formatLastMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      // 7 days
      return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderChatThread = (thread: ChatThread) => {
    const otherParticipant = thread.otherParticipants[0]; // For individual chats
    const displayName = otherParticipant
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
      : thread.title || 'Unknown';

    const lastMessage = thread.lastMessage;
    const lastMessagePreview = lastMessage?.content || 'No messages yet';
    const lastMessageTime = formatLastMessageTime(thread.lastMessageAt || thread.createdAt);

    return (
      <TouchableOpacity
        key={thread._id}
        onPress={() => handleThreadPress(thread._id)}
        activeOpacity={0.7}
        className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3'
      >
        <View className='flex-row items-center'>
          {/* Avatar */}
          <View className='w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3'>
            <Text className='text-blue-600 font-bold text-lg'>
              {otherParticipant?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>

          {/* Content */}
          <View className='flex-1'>
            <View className='flex-row items-center justify-between mb-1'>
              <Text className='font-semibold text-gray-900 text-base flex-1' numberOfLines={1}>
                {displayName}
              </Text>
              <Text className='text-xs text-gray-500 ml-2'>{lastMessageTime}</Text>
            </View>

            <View className='flex-row items-center justify-between'>
              <Text
                className={cn(
                  'text-sm flex-1 mr-2',
                  thread.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                )}
                numberOfLines={1}
              >
                {lastMessagePreview}
              </Text>

              {thread.unreadCount > 0 && (
                <View className='bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1'>
                  <Text className='text-white text-xs font-bold'>
                    {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Priority indicator */}
          {thread.priority === 'urgent' && (
            <View className='ml-2'>
              <Ionicons name='warning' size={16} color='#EF4444' />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader
        title='Messages'
        type='back'
        icon='chatbubbles'
        subtitle='Your conversations'
        className='mb-4'
        rightSlot={
          <TouchableOpacity
            onPress={handleStartChat}
            className='bg-white/20 border border-white/25 rounded-lg px-3 py-2'
          >
            <Text className='text-white text-sm font-medium'>New Chat</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        className='flex-1 px-4'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {chatThreadsData === undefined ? (
          // Loading state
          <View className='space-y-3'>
            {[1, 2, 3].map(i => (
              <View key={i} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                <View className='animate-pulse'>
                  <View className='flex-row items-center'>
                    <View className='w-12 h-12 bg-gray-200 rounded-full mr-3'></View>
                    <View className='flex-1'>
                      <View className='h-4 bg-gray-200 rounded w-3/4 mb-2'></View>
                      <View className='h-3 bg-gray-200 rounded w-full'></View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : chatThreadsData.threads.length > 0 ? (
          chatThreadsData.threads.map(renderChatThread)
        ) : (
          <View className='flex-1 items-center justify-center py-20'>
            <Ionicons name='chatbubbles-outline' size={64} color='#D1D5DB' />
            <Text className='text-gray-500 text-center mt-4 text-lg font-medium'>No conversations yet</Text>
            <Text className='text-gray-400 text-center mt-1 text-sm'>Start a chat with your property manager</Text>
            <Button onPress={handleStartChat} variant='default' className='mt-4 bg-blue-500'>
              <Ionicons name='add' size={16} color='white' />
              <Text className='text-white font-medium ml-1'>Start New Chat</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
