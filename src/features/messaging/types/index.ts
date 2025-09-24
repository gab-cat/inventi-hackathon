import { Id } from '@convex/_generated/dataModel';

// Base types from schema
export interface ChatThread {
  _id: Id<'chatThreads'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  threadType: 'individual' | 'group' | 'maintenance' | 'emergency';
  title?: string;
  participants: Id<'users'>[];
  lastMessageAt?: number;
  isArchived: boolean;
  assignedTo?: Id<'users'>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  _id: Id<'messages'>;
  _creationTime: number;
  threadId: Id<'chatThreads'>;
  senderId: Id<'users'>;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  isRead: boolean;
  readBy?: {
    userId: Id<'users'>;
    readAt: number;
  }[];
  replyTo?: Id<'messages'>;
  editedAt?: number;
  deletedAt?: number;
  createdAt: number;
}

// Extended types with joined data
export interface ChatThreadWithDetails extends ChatThread {
  property: {
    _id: Id<'properties'>;
    name: string;
  };
  participantDetails: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  }[];
  assignedToDetails?: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  unreadCount: number;
}

export interface MessageWithDetails extends Message {
  sender: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  replyToMessage?: {
    _id: Id<'messages'>;
    content: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
}

// Form types
export interface CreateChatThreadForm {
  propertyId: string;
  threadType: 'individual' | 'group' | 'maintenance' | 'emergency';
  title?: string;
  participants: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  initialMessage?: string;
}

export interface SendMessageForm {
  threadId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  replyTo?: string;
}

export interface SendGroupMessageForm {
  propertyId: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'tenants' | 'managers' | 'specific_units';
  targetUnits?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
}

// Component props
export interface ChatThreadListProps {
  threads: ChatThreadWithDetails[];
  isLoading: boolean;
  onThreadSelect: (threadId: string) => void;
  selectedThreadId?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currentUserId: string;
}

export interface ChatThreadItemProps {
  thread: ChatThreadWithDetails;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

export interface MessageListProps {
  messages: MessageWithDetails[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currentUserId: string;
  isMobile?: boolean;
}

export interface MessageItemProps {
  message: MessageWithDetails;
  currentUserId: string;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export interface MessageInputProps {
  threadId: string;
  onSendMessage: (
    content: string,
    messageType: 'text' | 'image' | 'file',
    attachments?: any[],
    replyTo?: string
  ) => void;
  onUploadAttachment?: (file: File) => Promise<string>;
  replyTo?: MessageWithDetails;
  onCancelReply?: () => void;
  disabled?: boolean;
  isMobile?: boolean;
}

export interface ChatThreadDetailProps {
  threadId: string;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (employeeId: string) => void;
  onArchive?: (isArchived: boolean) => void;
  onModerate?: (action: string, targetUserId?: string, reason?: string) => void;
  currentUserId: string;
}

export interface MessageAnalyticsProps {
  propertyId: string;
  startDate?: number;
  endDate?: number;
}

// Hook return types
export interface UseChatThreadsReturn {
  threads: ChatThreadWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export interface UseMessagesReturn {
  messages: MessageWithDetails[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export interface UseMessageMutationsReturn {
  sendMessage: (data: SendMessageForm) => Promise<void>;
  markAsRead: (messageId?: string, threadId?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  uploadAttachment: (threadId: string, file: File) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export interface UseChatThreadMutationsReturn {
  createThread: (data: CreateChatThreadForm) => Promise<string>;
  assignThread: (threadId: string, employeeId: string) => Promise<void>;
  sendGroupMessage: (data: SendGroupMessageForm) => Promise<string>;
  moderateChat: (threadId: string, action: string, targetUserId?: string, reason?: string) => Promise<void>;
  archiveThread: (threadId: string, isArchived: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
