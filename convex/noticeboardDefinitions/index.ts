// Web Queries
export * from './web/queries/getNotices';
export * from './web/queries/getAllUnits';
export * from './web/queries/getNoticeById';
export * from './web/queries/getNoticeAcknowledgments';
export * from './web/queries/getManagerProperties';
export * from './web/queries/getUnitsByProperty';
export * from './web/queries/getAllUnits';

// Web Mutations
export * from './web/mutations/createNotice';
export * from './web/mutations/updateNotice';
export * from './web/mutations/deleteNotice';
export * from './web/mutations/sendNoticeToAll';
export * from './web/mutations/sendNoticeToUnit';
export * from './web/mutations/scheduleNotice';
export * from './web/mutations/acknowledgeNotice';

// Mobile Queries
export {
  mobileGetNoticesArgs as getNoticesArgs,
  mobileGetNoticesHandler as getNoticesHandler,
  mobileGetNoticesReturns as getNoticesReturns,
} from './mobile/queries/getNotices';
export {
  mobileGetNoticeByIdArgs as getNoticeByIdArgs,
  mobileGetNoticeByIdHandler as getNoticeByIdHandler,
  mobileGetNoticeByIdReturns as getNoticeByIdReturns,
} from './mobile/queries/getNoticeById';
export {
  mobileGetEventsArgs as getEventsArgs,
  mobileGetEventsHandler as getEventsHandler,
  mobileGetEventsReturns as getEventsReturns,
} from './mobile/queries/getEvents';
export {
  mobileGetActivePollsArgs as getActivePollsArgs,
  mobileGetActivePollsHandler as getActivePollsHandler,
  mobileGetActivePollsReturns as getActivePollsReturns,
} from './mobile/queries/getActivePolls';
export {
  mobileGetCommunityNewsArgs as getCommunityNewsArgs,
  mobileGetCommunityNewsHandler as getCommunityNewsHandler,
  mobileGetCommunityNewsReturns as getCommunityNewsReturns,
} from './mobile/queries/getCommunityNews';

// Mobile Mutations
export {
  mobileAcknowledgeNoticeArgs as acknowledgeNoticeArgs,
  mobileAcknowledgeNoticeHandler as acknowledgeNoticeHandler,
  mobileAcknowledgeNoticeReturns as acknowledgeNoticeReturns,
} from './mobile/mutations/acknowledgeNotice';
export {
  mobileAddEventToCalendarArgs as addEventToCalendarArgs,
  mobileAddEventToCalendarHandler as addEventToCalendarHandler,
  mobileAddEventToCalendarReturns as addEventToCalendarReturns,
} from './mobile/mutations/addEventToCalendar';
export {
  mobileSubmitPollResponseArgs as submitPollResponseArgs,
  mobileSubmitPollResponseHandler as submitPollResponseHandler,
  mobileSubmitPollResponseReturns as submitPollResponseReturns,
} from './mobile/mutations/submitPollResponse';
export {
  mobileSendFeedbackArgs as sendFeedbackArgs,
  mobileSendFeedbackHandler as sendFeedbackHandler,
  mobileSendFeedbackReturns as sendFeedbackReturns,
} from './mobile/mutations/sendFeedback';
