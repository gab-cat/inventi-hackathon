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
