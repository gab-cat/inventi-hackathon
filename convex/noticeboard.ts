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
