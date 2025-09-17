import { query, mutation } from './_generated/server';
import {
  getNoticesArgs,
  getNoticesHandler,
  getNoticesReturns,
  getNoticeByIdArgs,
  getNoticeByIdHandler,
  getNoticeByIdReturns,
  getNoticeAcknowledgmentsArgs,
  getNoticeAcknowledgmentsHandler,
  getNoticeAcknowledgmentsReturns,
  getManagerPropertiesArgs,
  getManagerPropertiesHandler,
  getManagerPropertiesReturns,
  getUnitsByPropertyArgs,
  getUnitsByPropertyHandler,
  getUnitsByPropertyReturns,
  getAllUnitsArgs,
  getAllUnitsHandler,
  getAllUnitsReturns,
  createNoticeArgs,
  createNoticeHandler,
  createNoticeReturns,
  updateNoticeArgs,
  updateNoticeHandler,
  updateNoticeReturns,
  deleteNoticeArgs,
  deleteNoticeHandler,
  deleteNoticeReturns,
  sendNoticeToAllArgs,
  sendNoticeToAllHandler,
  sendNoticeToAllReturns,
  sendNoticeToUnitArgs,
  sendNoticeToUnitHandler,
  sendNoticeToUnitReturns,
  scheduleNoticeArgs,
  scheduleNoticeHandler,
  scheduleNoticeReturns,
  acknowledgeNoticeArgs,
  acknowledgeNoticeHandler,
  acknowledgeNoticeReturns,
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
export const getNotices = query({
  args: getNoticesArgs,
  returns: getNoticesReturns,
  handler: getNoticesHandler,
});

export const getNoticeById = query({
  args: getNoticeByIdArgs,
  returns: getNoticeByIdReturns,
  handler: getNoticeByIdHandler,
});

export const getNoticeAcknowledgments = query({
  args: getNoticeAcknowledgmentsArgs,
  returns: getNoticeAcknowledgmentsReturns,
  handler: getNoticeAcknowledgmentsHandler,
});

export const getManagerProperties = query({
  args: getManagerPropertiesArgs,
  returns: getManagerPropertiesReturns,
  handler: getManagerPropertiesHandler,
});

export const getUnitsByProperty = query({
  args: getUnitsByPropertyArgs,
  returns: getUnitsByPropertyReturns,
  handler: getUnitsByPropertyHandler,
});

export const getAllUnits = query({
  args: getAllUnitsArgs,
  returns: getAllUnitsReturns,
  handler: getAllUnitsHandler,
});

// Mutations
export const createNotice = mutation({
  args: createNoticeArgs,
  returns: createNoticeReturns,
  handler: createNoticeHandler,
});

export const updateNotice = mutation({
  args: updateNoticeArgs,
  returns: updateNoticeReturns,
  handler: updateNoticeHandler,
});

export const deleteNotice = mutation({
  args: deleteNoticeArgs,
  returns: deleteNoticeReturns,
  handler: deleteNoticeHandler,
});

export const sendNoticeToAll = mutation({
  args: sendNoticeToAllArgs,
  returns: sendNoticeToAllReturns,
  handler: sendNoticeToAllHandler,
});

export const sendNoticeToUnit = mutation({
  args: sendNoticeToUnitArgs,
  returns: sendNoticeToUnitReturns,
  handler: sendNoticeToUnitHandler,
});

export const scheduleNotice = mutation({
  args: scheduleNoticeArgs,
  returns: scheduleNoticeReturns,
  handler: scheduleNoticeHandler,
});

export const acknowledgeNotice = mutation({
  args: acknowledgeNoticeArgs,
  returns: acknowledgeNoticeReturns,
  handler: acknowledgeNoticeHandler,
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
