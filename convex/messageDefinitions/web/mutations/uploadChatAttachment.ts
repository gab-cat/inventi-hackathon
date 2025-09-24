import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webUploadChatAttachmentArgs = {
  threadId: v.id('chatThreads'),
  fileName: v.string(),
  fileUrl: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
};

export const webUploadChatAttachmentReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  attachment: v.object({
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  }),
});

export const webUploadChatAttachmentHandler = async (ctx: any, args: any) => {
  const { threadId, fileName, fileUrl, fileType, fileSize } = args;

  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  // Get thread and check access
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    throw new Error('Thread not found');
  }

  if (!thread.participants.includes(user._id)) {
    throw new Error('Access denied');
  }

  // Validate file size (e.g., max 10MB)
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  if (fileSize > maxFileSize) {
    throw new Error('File size exceeds maximum allowed size of 10MB');
  }

  // Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedTypes.includes(fileType)) {
    throw new Error('File type not allowed');
  }

  const attachment = {
    fileName,
    fileUrl,
    fileType,
    fileSize,
  };

  // Create a message with the attachment
  await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content: `Shared file: ${fileName}`,
    messageType: fileType.startsWith('image/') ? 'image' : 'file',
    attachments: [attachment],
    isRead: false,
    createdAt: Date.now(),
  });

  // Update thread with last message time
  await ctx.db.patch(threadId, {
    lastMessageAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    success: true,
    message: 'Attachment uploaded successfully',
    attachment,
  };
};

export type UploadChatAttachmentArgs = typeof webUploadChatAttachmentArgs;
export type UploadChatAttachmentReturns = typeof webUploadChatAttachmentReturns;
export type UploadChatAttachmentHandler = typeof webUploadChatAttachmentHandler;
