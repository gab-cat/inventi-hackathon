import { query, mutation } from './_generated/server';
import {
  webGetMessagesByThreadIdArgs,
  webGetMessagesByThreadIdHandler,
  webGetMessagesByThreadIdReturns,
  webGetUnreadMessageCountArgs,
  webGetUnreadMessageCountHandler,
  webGetUnreadMessageCountReturns,
  webSearchMessagesArgs,
  webSearchMessagesHandler,
  webSearchMessagesReturns,
} from './messageDefinitions/web/queries/index';
import {
  webSendMessageArgs,
  webSendMessageHandler,
  webSendMessageReturns,
  webMarkMessageReadArgs,
  webMarkMessageReadHandler,
  webMarkMessageReadReturns,
  webUploadChatAttachmentArgs,
  webUploadChatAttachmentHandler,
  webUploadChatAttachmentReturns,
  webEditMessageArgs,
  webEditMessageHandler,
  webEditMessageReturns,
  webDeleteMessageArgs,
  webDeleteMessageHandler,
  webDeleteMessageReturns,
} from './messageDefinitions/web/mutations';
import {
  mobileGetChatThreadsArgs,
  mobileGetChatThreadsHandler,
  mobileGetChatThreadsReturns,
  mobileGetMessagesByThreadIdArgs,
  mobileGetMessagesByThreadIdHandler,
  mobileGetMessagesByThreadIdReturns,
} from './messageDefinitions/mobile/queries/index';
import {
  mobileSendMessageArgs,
  mobileSendMessageHandler,
  mobileSendMessageReturns,
  mobileMarkMessageReadArgs,
  mobileMarkMessageReadHandler,
  mobileMarkMessageReadReturns,
  mobileUploadChatAttachmentArgs,
  mobileUploadChatAttachmentHandler,
  mobileUploadChatAttachmentReturns,
  mobileStartChatWithManagerArgs,
  mobileStartChatWithManagerHandler,
  mobileStartChatWithManagerReturns,
} from './messageDefinitions/mobile/mutations';

// Web Message Queries
export const webGetMessagesByThreadId = query({
  args: webGetMessagesByThreadIdArgs,
  returns: webGetMessagesByThreadIdReturns,
  handler: webGetMessagesByThreadIdHandler,
});

export const webGetUnreadMessageCount = query({
  args: webGetUnreadMessageCountArgs,
  returns: webGetUnreadMessageCountReturns,
  handler: webGetUnreadMessageCountHandler,
});

export const webSearchMessages = query({
  args: webSearchMessagesArgs,
  returns: webSearchMessagesReturns,
  handler: webSearchMessagesHandler,
});

// Web Message Mutations
export const webSendMessage = mutation({
  args: webSendMessageArgs,
  returns: webSendMessageReturns,
  handler: webSendMessageHandler,
});

export const webMarkMessageRead = mutation({
  args: webMarkMessageReadArgs,
  returns: webMarkMessageReadReturns,
  handler: webMarkMessageReadHandler,
});

export const webUploadChatAttachment = mutation({
  args: webUploadChatAttachmentArgs,
  returns: webUploadChatAttachmentReturns,
  handler: webUploadChatAttachmentHandler,
});

export const webEditMessage = mutation({
  args: webEditMessageArgs,
  returns: webEditMessageReturns,
  handler: webEditMessageHandler,
});

export const webDeleteMessage = mutation({
  args: webDeleteMessageArgs,
  returns: webDeleteMessageReturns,
  handler: webDeleteMessageHandler,
});

// Mobile Message Queries
export const mobileGetChatThreads = query({
  args: mobileGetChatThreadsArgs,
  returns: mobileGetChatThreadsReturns,
  handler: mobileGetChatThreadsHandler,
});

export const mobileGetMessagesByThreadId = query({
  args: mobileGetMessagesByThreadIdArgs,
  returns: mobileGetMessagesByThreadIdReturns,
  handler: mobileGetMessagesByThreadIdHandler,
});

// Mobile Message Mutations
export const mobileSendMessage = mutation({
  args: mobileSendMessageArgs,
  returns: mobileSendMessageReturns,
  handler: mobileSendMessageHandler,
});

export const mobileMarkMessageRead = mutation({
  args: mobileMarkMessageReadArgs,
  returns: mobileMarkMessageReadReturns,
  handler: mobileMarkMessageReadHandler,
});

export const mobileUploadChatAttachment = mutation({
  args: mobileUploadChatAttachmentArgs,
  returns: mobileUploadChatAttachmentReturns,
  handler: mobileUploadChatAttachmentHandler,
});

export const mobileStartChatWithManager = mutation({
  args: mobileStartChatWithManagerArgs,
  returns: mobileStartChatWithManagerReturns,
  handler: mobileStartChatWithManagerHandler,
});
