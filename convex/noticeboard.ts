import { query, mutation } from './_generated/server';
import {
  // Web functions
  webGetNoticesArgs,
  webGetNoticesHandler,
  webGetNoticesReturns,
  webGetNoticesCountArgs,
  webGetNoticesCountHandler,
  webGetNoticesCountReturns,
  webGetNoticeByIdArgs,
  webGetNoticeByIdHandler,
  webGetNoticeByIdReturns,
  webGetNoticeAcknowledgmentsArgs,
  webGetNoticeAcknowledgmentsHandler,
  webGetNoticeAcknowledgmentsReturns,
  webGetManagerPropertiesArgs,
  webGetManagerPropertiesHandler,
  webGetManagerPropertiesReturns,
  webGetUnitsByPropertyArgs,
  webGetUnitsByPropertyHandler,
  webGetUnitsByPropertyReturns,
  webGetAllUnitsArgs,
  webGetAllUnitsHandler,
  webGetAllUnitsReturns,
  webCreateNoticeArgs,
  webCreateNoticeHandler,
  webCreateNoticeReturns,
  webUpdateNoticeArgs,
  webUpdateNoticeHandler,
  webUpdateNoticeReturns,
  webDeleteNoticeArgs,
  webDeleteNoticeHandler,
  webDeleteNoticeReturns,
  webSendNoticeToAllArgs,
  webSendNoticeToAllHandler,
  webSendNoticeToAllReturns,
  webSendNoticeToUnitArgs,
  webSendNoticeToUnitHandler,
  webSendNoticeToUnitReturns,
  webScheduleNoticeArgs,
  webScheduleNoticeHandler,
  webScheduleNoticeReturns,
  webAcknowledgeNoticeArgs,
  webAcknowledgeNoticeHandler,
  webAcknowledgeNoticeReturns,

  // Mobile functions
  getNoticesArgs as mobileGetNoticesArgs,
  getNoticesHandler as mobileGetNoticesHandler,
  getNoticesReturns as mobileGetNoticesReturns,
  getNoticeByIdArgs as mobileGetNoticeByIdArgs,
  getNoticeByIdHandler as mobileGetNoticeByIdHandler,
  getNoticeByIdReturns as mobileGetNoticeByIdReturns,
  acknowledgeNoticeArgs as mobileAcknowledgeNoticeArgs,
  acknowledgeNoticeHandler as mobileAcknowledgeNoticeHandler,
  acknowledgeNoticeReturns as mobileAcknowledgeNoticeReturns,
  getEventsArgs as mobileGetEventsArgs,
  getEventsHandler as mobileGetEventsHandler,
  getEventsReturns as mobileGetEventsReturns,
  addEventToCalendarArgs as mobileAddEventToCalendarArgs,
  addEventToCalendarHandler as mobileAddEventToCalendarHandler,
  addEventToCalendarReturns as mobileAddEventToCalendarReturns,
  getActivePollsArgs as mobileGetActivePollsArgs,
  getActivePollsHandler as mobileGetActivePollsHandler,
  getActivePollsReturns as mobileGetActivePollsReturns,
  submitPollResponseArgs as mobileSubmitPollResponseArgs,
  submitPollResponseHandler as mobileSubmitPollResponseHandler,
  submitPollResponseReturns as mobileSubmitPollResponseReturns,
  sendFeedbackArgs as mobileSendFeedbackArgs,
  sendFeedbackHandler as mobileSendFeedbackHandler,
  sendFeedbackReturns as mobileSendFeedbackReturns,
  getCommunityNewsArgs as mobileGetCommunityNewsArgs,
  getCommunityNewsHandler as mobileGetCommunityNewsHandler,
  getCommunityNewsReturns as mobileGetCommunityNewsReturns,
} from './noticeboardDefinitions/index';

// Queries
export const webGetNotices = query({
  args: webGetNoticesArgs,
  returns: webGetNoticesReturns,
  handler: webGetNoticesHandler,
});

export const webGetNoticesCount = query({
  args: webGetNoticesCountArgs,
  returns: webGetNoticesCountReturns,
  handler: webGetNoticesCountHandler,
});

export const webGetNoticeById = query({
  args: webGetNoticeByIdArgs,
  returns: webGetNoticeByIdReturns,
  handler: webGetNoticeByIdHandler,
});

export const webGetNoticeAcknowledgments = query({
  args: webGetNoticeAcknowledgmentsArgs,
  returns: webGetNoticeAcknowledgmentsReturns,
  handler: webGetNoticeAcknowledgmentsHandler,
});

export const webGetManagerProperties = query({
  args: webGetManagerPropertiesArgs,
  returns: webGetManagerPropertiesReturns,
  handler: webGetManagerPropertiesHandler,
});

export const webGetUnitsByProperty = query({
  args: webGetUnitsByPropertyArgs,
  returns: webGetUnitsByPropertyReturns,
  handler: webGetUnitsByPropertyHandler,
});

export const webGetAllUnits = query({
  args: webGetAllUnitsArgs,
  returns: webGetAllUnitsReturns,
  handler: webGetAllUnitsHandler,
});

// Mutations
export const webCreateNotice = mutation({
  args: webCreateNoticeArgs,
  returns: webCreateNoticeReturns,
  handler: webCreateNoticeHandler,
});

export const webUpdateNotice = mutation({
  args: webUpdateNoticeArgs,
  returns: webUpdateNoticeReturns,
  handler: webUpdateNoticeHandler,
});

export const webDeleteNotice = mutation({
  args: webDeleteNoticeArgs,
  returns: webDeleteNoticeReturns,
  handler: webDeleteNoticeHandler,
});

export const webSendNoticeToAll = mutation({
  args: webSendNoticeToAllArgs,
  returns: webSendNoticeToAllReturns,
  handler: webSendNoticeToAllHandler,
});

export const webSendNoticeToUnit = mutation({
  args: webSendNoticeToUnitArgs,
  returns: webSendNoticeToUnitReturns,
  handler: webSendNoticeToUnitHandler,
});

export const webScheduleNotice = mutation({
  args: webScheduleNoticeArgs,
  returns: webScheduleNoticeReturns,
  handler: webScheduleNoticeHandler,
});

export const webAcknowledgeNotice = mutation({
  args: webAcknowledgeNoticeArgs,
  returns: webAcknowledgeNoticeReturns,
  handler: webAcknowledgeNoticeHandler,
});

// Mobile-specific functions for tenant users
export const mobileGetNotices = query({
  args: mobileGetNoticesArgs,
  returns: mobileGetNoticesReturns,
  handler: mobileGetNoticesHandler,
});

export const mobileGetNoticeById = query({
  args: mobileGetNoticeByIdArgs,
  returns: mobileGetNoticeByIdReturns,
  handler: mobileGetNoticeByIdHandler,
});

export const mobileAcknowledgeNotice = mutation({
  args: mobileAcknowledgeNoticeArgs,
  returns: mobileAcknowledgeNoticeReturns,
  handler: mobileAcknowledgeNoticeHandler,
});

export const mobileGetEvents = query({
  args: mobileGetEventsArgs,
  returns: mobileGetEventsReturns,
  handler: mobileGetEventsHandler,
});

export const mobileAddEventToCalendar = mutation({
  args: mobileAddEventToCalendarArgs,
  returns: mobileAddEventToCalendarReturns,
  handler: mobileAddEventToCalendarHandler,
});

export const mobileGetActivePolls = query({
  args: mobileGetActivePollsArgs,
  returns: mobileGetActivePollsReturns,
  handler: mobileGetActivePollsHandler,
});

export const mobileSubmitPollResponse = mutation({
  args: mobileSubmitPollResponseArgs,
  returns: mobileSubmitPollResponseReturns,
  handler: mobileSubmitPollResponseHandler,
});

export const mobileSendFeedback = mutation({
  args: mobileSendFeedbackArgs,
  returns: mobileSendFeedbackReturns,
  handler: mobileSendFeedbackHandler,
});

export const mobileGetCommunityNews = query({
  args: mobileGetCommunityNewsArgs,
  returns: mobileGetCommunityNewsReturns,
  handler: mobileGetCommunityNewsHandler,
});
