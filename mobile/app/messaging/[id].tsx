import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Id } from '@convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type Message = {
  _id: Id<'messages'>;
  threadId: Id<'chatThreads'>;
  senderId: Id<'users'>;
  content: string;
  messageType: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  isRead: boolean;
  createdAt: number;
  sender: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
};

export default function ConversationScreen() {
  const currentUser = useQuery(api.user.getCurrentUser);
  const user = currentUser?.user;

  const { id } = useLocalSearchParams();
  const threadId = id as Id<'chatThreads'>;

  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch messages
  const messagesData = useQuery(api.messages.mobileGetMessagesByThreadId, {
    threadId,
    limit: 50,
  });

  // Mutations
  const sendMessage = useMutation(api.messages.mobileSendMessage);
  const markMessageRead = useMutation(api.messages.mobileMarkMessageRead);

  // Mark messages as read when entering the conversation
  useEffect(() => {
    if (messagesData?.messages && user?._id) {
      const unreadMessageIds = messagesData.messages
        .filter(msg => !msg.isRead && msg.sender._id !== user._id)
        .map(msg => msg._id);

      if (unreadMessageIds.length > 0) {
        markMessageRead({ threadId, messageIds: unreadMessageIds });
      }
    }
  }, [messagesData, markMessageRead, threadId, user?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messagesData?.messages) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messagesData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const result = await sendMessage({
        threadId,
        content: messageText.trim(),
        messageType: 'text',
      });

      if (result.success) {
        setMessageText('');
        // Scroll to bottom after sending
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageTime.toLocaleDateString([], { weekday: 'long' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!currentUser || !user) {
    return <Text>Loading...</Text>;
  }

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.sender._id === user?._id;
    const showTimestamp =
      index === 0 ||
      !messagesData?.messages ||
      messagesData.messages[index - 1].sender._id !== message.sender._id ||
      messagesData.messages[index].createdAt - messagesData.messages[index - 1].createdAt > 300000; // 5 minutes

    // Show avatars only for 2-participant conversations
    const showAvatars = messagesData?.messages
      ? new Set(messagesData.messages.map(m => m.sender._id)).size === 2
      : false;

    return (
      <View key={message._id} className={cn('mb-1', isCurrentUser ? 'items-end' : 'items-start')}>
        {showTimestamp && (
          <Text className={cn('text-xs text-gray-500 mb-2 mt-2 px-4', isCurrentUser ? 'text-right' : 'text-left')}>
            {message.sender.firstName} {message.sender.lastName} • {formatMessageTime(message.createdAt)}
          </Text>
        )}

        <View className={cn('flex-row items-end', isCurrentUser ? 'justify-end' : 'justify-start')}>
          {/* Avatar for other participant only */}
          {!isCurrentUser && showAvatars && (
            <View className='mr-3'>
              {message.sender.profileImage ? (
                <Image source={{ uri: message.sender.profileImage }} className='w-8 h-8 rounded-full' />
              ) : (
                <View className='w-8 h-8 rounded-full bg-gray-300 items-center justify-center'>
                  <Text className='text-gray-600 font-medium text-sm'>
                    {message.sender.firstName?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View
            className={cn(
              'max-w-[70%] rounded-2xl px-4 py-3',
              isCurrentUser ? 'bg-blue-500 rounded-br-md' : 'bg-white border border-gray-200 rounded-bl-md'
            )}
          >
            {message.attachments && message.attachments.length > 0 && (
              <View className='mb-2'>
                {message.attachments.map((attachment, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className='flex-row items-center bg-gray-50 rounded-lg p-2 mb-1'
                    onPress={() => {
                      /* TODO: Open attachment */
                    }}
                  >
                    <Ionicons name='document-outline' size={16} color='#6B7280' />
                    <Text className='text-sm text-gray-700 ml-2 flex-1' numberOfLines={1}>
                      {attachment.fileName}
                    </Text>
                    <Ionicons name='download-outline' size={16} color='#6B7280' />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text className={cn('text-sm leading-5', isCurrentUser ? 'text-white' : 'text-gray-900')}>
              {message.content}
            </Text>
          </View>
        </View>

        {!isCurrentUser && !message.isRead && <View className='w-2 h-2 bg-blue-500 rounded-full mt-1 ml-11' />}
      </View>
    );
  };

  const otherParticipant = messagesData?.messages?.[0]
    ? messagesData!.messages[0].sender._id === user?._id
      ? messagesData!.messages.find(msg => msg.sender._id !== user?._id)?.sender
      : messagesData!.messages[0].sender
    : undefined;

  const displayName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Chat';

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <KeyboardAvoidingView
        className='flex-1'
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <PageHeader
          title={displayName}
          type='back'
          icon='chatbubbles'
          subtitle={otherParticipant?.role.charAt(0).toUpperCase() + otherParticipant?.role.slice(1) || 'Conversation'}
          className='mb-0'
        />

        <View className='flex-1'>
          <ScrollView
            ref={scrollViewRef}
            className='flex-1 px-4'
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className='py-4'>
              {messagesData === undefined ? (
                // Loading state
                <View className='space-y-2'>
                  {[1, 2, 3].map(i => (
                    <View
                      key={i}
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        i % 2 === 0 ? 'self-end bg-blue-100' : 'self-start bg-white border border-gray-200'
                      )}
                    >
                      <View className='animate-pulse'>
                        <View className='h-4 bg-gray-200 rounded w-24 mb-1'></View>
                        <View className='h-3 bg-gray-200 rounded w-16'></View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : messagesData.messages.length > 0 ? (
                messagesData.messages.map(renderMessage)
              ) : (
                <View className='flex-1 items-center justify-center py-20'>
                  <Ionicons name='chatbubbles-outline' size={64} color='#D1D5DB' />
                  <Text className='text-gray-500 text-center mt-4 text-lg font-medium'>No messages yet</Text>
                  <Text className='text-gray-400 text-center mt-1 text-sm'>
                    Start the conversation by sending a message
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Message Input */}
        <View className='bg-white border-t border-gray-200 px-4 py-3 mt-auto'>
          <View className='flex-row items-end space-x-2 gap-2'>
            <View className='flex-1 flex-row items-end bg-gray-100 rounded-2xl px-4 py-1'>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder='Type a message...'
                multiline
                className='flex-1 text-gray-900 text-sm leading-5 max-h-20'
                style={{ textAlignVertical: 'center' }}
              />
            </View>

            <Button
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
              variant='default'
              size='icon'
              className={cn('w-11 h-11 rounded-full', messageText.trim() ? 'bg-blue-500' : 'bg-gray-300')}
            >
              <Ionicons name='send' size={16} color='white' />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
