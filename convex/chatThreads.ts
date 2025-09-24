import { query, mutation } from './_generated/server';
import {
  webGetAllChatThreadsArgs,
  webGetAllChatThreadsHandler,
  webGetAllChatThreadsReturns,
  webGetChatThreadByIdArgs,
  webGetChatThreadByIdHandler,
  webGetChatThreadByIdReturns,
  webGetChatThreadsByPropertyArgs,
  webGetChatThreadsByPropertyHandler,
  webGetChatThreadsByPropertyReturns,
  webGetMessageAnalyticsArgs,
  webGetMessageAnalyticsHandler,
  webGetMessageAnalyticsReturns,
} from './chatThreadDefinitions/web/queries/index';
import {
  webAssignThreadToEmployeeArgs,
  webAssignThreadToEmployeeHandler,
  webAssignThreadToEmployeeReturns,
  webSendGroupMessageArgs,
  webSendGroupMessageHandler,
  webSendGroupMessageReturns,
  webModerateChatArgs,
  webModerateChatHandler,
  webModerateChatReturns,
  webArchiveChatThreadArgs,
  webArchiveChatThreadHandler,
  webArchiveChatThreadReturns,
  webCreateChatThreadArgs,
  webCreateChatThreadHandler,
  webCreateChatThreadReturns,
} from './chatThreadDefinitions/web/mutations/index';

// Web Chat Thread Queries
export const webGetAllChatThreads = query({
  args: webGetAllChatThreadsArgs,
  returns: webGetAllChatThreadsReturns,
  handler: webGetAllChatThreadsHandler,
});

export const webGetChatThreadById = query({
  args: webGetChatThreadByIdArgs,
  returns: webGetChatThreadByIdReturns,
  handler: webGetChatThreadByIdHandler,
});

export const webGetChatThreadsByProperty = query({
  args: webGetChatThreadsByPropertyArgs,
  returns: webGetChatThreadsByPropertyReturns,
  handler: webGetChatThreadsByPropertyHandler,
});

export const webGetMessageAnalytics = query({
  args: webGetMessageAnalyticsArgs,
  returns: webGetMessageAnalyticsReturns,
  handler: webGetMessageAnalyticsHandler,
});

// Web Chat Thread Mutations
export const webAssignThreadToEmployee = mutation({
  args: webAssignThreadToEmployeeArgs,
  returns: webAssignThreadToEmployeeReturns,
  handler: webAssignThreadToEmployeeHandler,
});

export const webSendGroupMessage = mutation({
  args: webSendGroupMessageArgs,
  returns: webSendGroupMessageReturns,
  handler: webSendGroupMessageHandler,
});

export const webModerateChat = mutation({
  args: webModerateChatArgs,
  returns: webModerateChatReturns,
  handler: webModerateChatHandler,
});

export const webArchiveChatThread = mutation({
  args: webArchiveChatThreadArgs,
  returns: webArchiveChatThreadReturns,
  handler: webArchiveChatThreadHandler,
});

export const webCreateChatThread = mutation({
  args: webCreateChatThreadArgs,
  returns: webCreateChatThreadReturns,
  handler: webCreateChatThreadHandler,
});
