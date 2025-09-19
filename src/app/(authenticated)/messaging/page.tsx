'use client';

import { useState } from 'react';
import { ChatSidebar, ChatMain, Conversation, Message } from '@/components/messaging';

// Mock data for demonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'John Smith',
    lastMessage: 'Hey, can you help me with the maintenance request?',
    timestamp: '2 min ago',
    unreadCount: 2,
    avatar: '/avatars/john.jpg',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    lastMessage: 'The new property listing looks great!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    avatar: '/avatars/sarah.jpg',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Mike Wilson',
    lastMessage: 'Thanks for the quick response',
    timestamp: '3 hours ago',
    unreadCount: 1,
    avatar: '/avatars/mike.jpg',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Emily Davis',
    lastMessage: 'Can we schedule a property viewing?',
    timestamp: '1 day ago',
    unreadCount: 0,
    avatar: '/avatars/emily.jpg',
    isOnline: false,
  },
  {
    id: '5',
    name: 'David Brown',
    lastMessage: 'The lease agreement is ready for review',
    timestamp: '2 days ago',
    unreadCount: 0,
    avatar: '/avatars/david.jpg',
    isOnline: true,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    content: 'Hey, can you help me with the maintenance request?',
    timestamp: '2:30 PM',
    isOwn: false,
  },
  {
    id: '2',
    senderId: 'current',
    content: 'Of course! What seems to be the issue?',
    timestamp: '2:32 PM',
    isOwn: true,
  },
  {
    id: '3',
    senderId: '1',
    content: 'The air conditioning in unit 3B is not working properly. It keeps making strange noises.',
    timestamp: '2:35 PM',
    isOwn: false,
  },
  {
    id: '4',
    senderId: 'current',
    content: "I'll send a technician to check it out. Can you provide more details about when the issue started?",
    timestamp: '2:37 PM',
    isOwn: true,
  },
  {
    id: '5',
    senderId: '1',
    content: 'It started yesterday evening. The unit was working fine in the morning.',
    timestamp: '2:40 PM',
    isOwn: false,
  },
];

export default function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');

  const currentConversation = mockConversations.find(c => c.id === selectedConversation);

  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log('New chat clicked');
  };

  const handleSendMessage = (content: string) => {
    // TODO: Implement send message functionality
    console.log('Sending message:', content);
  };

  return (
    <div className='h-[calc(100vh-8rem)] flex'>
      <ChatSidebar
        conversations={mockConversations}
        selectedConversationId={selectedConversation}
        onConversationSelect={setSelectedConversation}
        onNewChat={handleNewChat}
      />
      <ChatMain conversation={currentConversation || null} messages={mockMessages} onSendMessage={handleSendMessage} />
    </div>
  );
}
