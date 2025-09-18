/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as maintenance from "../maintenance.js";
import type * as maintenanceDefinitions_index from "../maintenanceDefinitions/index.js";
import type * as maintenanceDefinitions_mobile_index from "../maintenanceDefinitions/mobile/index.js";
import type * as maintenanceDefinitions_mobile_mutations_cancelRequest from "../maintenanceDefinitions/mobile/mutations/cancelRequest.js";
import type * as maintenanceDefinitions_mobile_mutations_createRequest from "../maintenanceDefinitions/mobile/mutations/createRequest.js";
import type * as maintenanceDefinitions_mobile_mutations_deleteRequest from "../maintenanceDefinitions/mobile/mutations/deleteRequest.js";
import type * as maintenanceDefinitions_mobile_mutations_index from "../maintenanceDefinitions/mobile/mutations/index.js";
import type * as maintenanceDefinitions_mobile_mutations_tenantConfirmCompletion from "../maintenanceDefinitions/mobile/mutations/tenantConfirmCompletion.js";
import type * as maintenanceDefinitions_mobile_mutations_updateRequest from "../maintenanceDefinitions/mobile/mutations/updateRequest.js";
import type * as maintenanceDefinitions_mobile_queries_getMyCurrentRequests from "../maintenanceDefinitions/mobile/queries/getMyCurrentRequests.js";
import type * as maintenanceDefinitions_mobile_queries_getRequestStatus from "../maintenanceDefinitions/mobile/queries/getRequestStatus.js";
import type * as maintenanceDefinitions_mobile_queries_getRequests from "../maintenanceDefinitions/mobile/queries/getRequests.js";
import type * as maintenanceDefinitions_mobile_queries_getRequestsById from "../maintenanceDefinitions/mobile/queries/getRequestsById.js";
import type * as maintenanceDefinitions_mobile_queries_index from "../maintenanceDefinitions/mobile/queries/index.js";
import type * as maintenanceDefinitions_web_mutations_assignTechnician from "../maintenanceDefinitions/web/mutations/assignTechnician.js";
import type * as maintenanceDefinitions_web_mutations_bulkUpdateStatus from "../maintenanceDefinitions/web/mutations/bulkUpdateStatus.js";
import type * as maintenanceDefinitions_web_mutations_updateMaintenanceCost from "../maintenanceDefinitions/web/mutations/updateMaintenanceCost.js";
import type * as maintenanceDefinitions_web_mutations_updateMaintenanceStatus from "../maintenanceDefinitions/web/mutations/updateMaintenanceStatus.js";
import type * as maintenanceDefinitions_web_queries_getMaintenanceKPIs from "../maintenanceDefinitions/web/queries/getMaintenanceKPIs.js";
import type * as maintenanceDefinitions_web_queries_getMaintenanceRequests from "../maintenanceDefinitions/web/queries/getMaintenanceRequests.js";
import type * as maintenanceDefinitions_web_queries_getMaintenanceTrends from "../maintenanceDefinitions/web/queries/getMaintenanceTrends.js";
import type * as maintenanceDefinitions_web_queries_getManagerProperties from "../maintenanceDefinitions/web/queries/getManagerProperties.js";
import type * as maintenanceDefinitions_web_queries_getTechnicianWorkload from "../maintenanceDefinitions/web/queries/getTechnicianWorkload.js";
import type * as maintenanceDefinitions_web_queries_getTechnicians from "../maintenanceDefinitions/web/queries/getTechnicians.js";
import type * as maintenanceDefinitions_web_queries_getUnitsByProperty from "../maintenanceDefinitions/web/queries/getUnitsByProperty.js";
import type * as noticeboard from "../noticeboard.js";
import type * as noticeboardDefinitions_index from "../noticeboardDefinitions/index.js";
import type * as noticeboardDefinitions_mobile_mutations_acknowledgeNotice from "../noticeboardDefinitions/mobile/mutations/acknowledgeNotice.js";
import type * as noticeboardDefinitions_mobile_mutations_addEventToCalendar from "../noticeboardDefinitions/mobile/mutations/addEventToCalendar.js";
import type * as noticeboardDefinitions_mobile_mutations_sendFeedback from "../noticeboardDefinitions/mobile/mutations/sendFeedback.js";
import type * as noticeboardDefinitions_mobile_mutations_submitPollResponse from "../noticeboardDefinitions/mobile/mutations/submitPollResponse.js";
import type * as noticeboardDefinitions_mobile_queries_getActivePolls from "../noticeboardDefinitions/mobile/queries/getActivePolls.js";
import type * as noticeboardDefinitions_mobile_queries_getCommunityNews from "../noticeboardDefinitions/mobile/queries/getCommunityNews.js";
import type * as noticeboardDefinitions_mobile_queries_getEvents from "../noticeboardDefinitions/mobile/queries/getEvents.js";
import type * as noticeboardDefinitions_mobile_queries_getNoticeById from "../noticeboardDefinitions/mobile/queries/getNoticeById.js";
import type * as noticeboardDefinitions_mobile_queries_getNotices from "../noticeboardDefinitions/mobile/queries/getNotices.js";
import type * as noticeboardDefinitions_web_mutations_acknowledgeNotice from "../noticeboardDefinitions/web/mutations/acknowledgeNotice.js";
import type * as noticeboardDefinitions_web_mutations_createNotice from "../noticeboardDefinitions/web/mutations/createNotice.js";
import type * as noticeboardDefinitions_web_mutations_deleteNotice from "../noticeboardDefinitions/web/mutations/deleteNotice.js";
import type * as noticeboardDefinitions_web_mutations_scheduleNotice from "../noticeboardDefinitions/web/mutations/scheduleNotice.js";
import type * as noticeboardDefinitions_web_mutations_sendNoticeToAll from "../noticeboardDefinitions/web/mutations/sendNoticeToAll.js";
import type * as noticeboardDefinitions_web_mutations_sendNoticeToUnit from "../noticeboardDefinitions/web/mutations/sendNoticeToUnit.js";
import type * as noticeboardDefinitions_web_mutations_updateNotice from "../noticeboardDefinitions/web/mutations/updateNotice.js";
import type * as noticeboardDefinitions_web_queries_getAllUnits from "../noticeboardDefinitions/web/queries/getAllUnits.js";
import type * as noticeboardDefinitions_web_queries_getManagerProperties from "../noticeboardDefinitions/web/queries/getManagerProperties.js";
import type * as noticeboardDefinitions_web_queries_getNoticeAcknowledgments from "../noticeboardDefinitions/web/queries/getNoticeAcknowledgments.js";
import type * as noticeboardDefinitions_web_queries_getNoticeById from "../noticeboardDefinitions/web/queries/getNoticeById.js";
import type * as noticeboardDefinitions_web_queries_getNotices from "../noticeboardDefinitions/web/queries/getNotices.js";
import type * as noticeboardDefinitions_web_queries_getUnitsByProperty from "../noticeboardDefinitions/web/queries/getUnitsByProperty.js";
import type * as property from "../property.js";
import type * as propertyDefinitions_index from "../propertyDefinitions/index.js";
import type * as propertyDefinitions_mobile_index from "../propertyDefinitions/mobile/index.js";
import type * as propertyDefinitions_mobile_queries_getMyProperties from "../propertyDefinitions/mobile/queries/getMyProperties.js";
import type * as propertyDefinitions_mobile_queries_getProperties from "../propertyDefinitions/mobile/queries/getProperties.js";
import type * as propertyDefinitions_mobile_queries_index from "../propertyDefinitions/mobile/queries/index.js";
import type * as seeders_notice from "../seeders/notice.js";
import type * as seeders_seed from "../seeders/seed.js";
import type * as tech from "../tech.js";
import type * as techDefinitions_mobile_index from "../techDefinitions/mobile/index.js";
import type * as techDefinitions_mobile_mutations_addMaintenancePhoto from "../techDefinitions/mobile/mutations/addMaintenancePhoto.js";
import type * as techDefinitions_mobile_mutations_checkinAsset from "../techDefinitions/mobile/mutations/checkinAsset.js";
import type * as techDefinitions_mobile_mutations_checkoutAsset from "../techDefinitions/mobile/mutations/checkoutAsset.js";
import type * as techDefinitions_mobile_mutations_index from "../techDefinitions/mobile/mutations/index.js";
import type * as techDefinitions_mobile_mutations_reportAssetIssue from "../techDefinitions/mobile/mutations/reportAssetIssue.js";
import type * as techDefinitions_mobile_mutations_requestTenantApproval from "../techDefinitions/mobile/mutations/requestTenantApproval.js";
import type * as techDefinitions_mobile_mutations_scheduleAssetMaintenance from "../techDefinitions/mobile/mutations/scheduleAssetMaintenance.js";
import type * as techDefinitions_mobile_mutations_updateMaintenanceCost from "../techDefinitions/mobile/mutations/updateMaintenanceCost.js";
import type * as techDefinitions_mobile_mutations_updateRequestStatus from "../techDefinitions/mobile/mutations/updateRequestStatus.js";
import type * as techDefinitions_mobile_mutations_uploadMaintenancePhoto from "../techDefinitions/mobile/mutations/uploadMaintenancePhoto.js";
import type * as techDefinitions_mobile_queries_getAssetInventory from "../techDefinitions/mobile/queries/getAssetInventory.js";
import type * as techDefinitions_mobile_queries_getAssignedRequests from "../techDefinitions/mobile/queries/getAssignedRequests.js";
import type * as techDefinitions_mobile_queries_getAvailableAssets from "../techDefinitions/mobile/queries/getAvailableAssets.js";
import type * as techDefinitions_mobile_queries_getMaintenanceDashboard from "../techDefinitions/mobile/queries/getMaintenanceDashboard.js";
import type * as techDefinitions_mobile_queries_getRequestDetails from "../techDefinitions/mobile/queries/getRequestDetails.js";
import type * as techDefinitions_mobile_queries_index from "../techDefinitions/mobile/queries/index.js";
import type * as unit from "../unit.js";
import type * as unitDefinitions_index from "../unitDefinitions/index.js";
import type * as unitDefinitions_mobile_index from "../unitDefinitions/mobile/index.js";
import type * as unitDefinitions_mobile_mutations_assignTenantToUnit from "../unitDefinitions/mobile/mutations/assignTenantToUnit.js";
import type * as unitDefinitions_mobile_mutations_createAndAssignUnit from "../unitDefinitions/mobile/mutations/createAndAssignUnit.js";
import type * as unitDefinitions_mobile_mutations_createUnit from "../unitDefinitions/mobile/mutations/createUnit.js";
import type * as unitDefinitions_mobile_mutations_index from "../unitDefinitions/mobile/mutations/index.js";
import type * as unitDefinitions_mobile_mutations_updateUnit from "../unitDefinitions/mobile/mutations/updateUnit.js";
import type * as unitDefinitions_mobile_queries_getMyUnits from "../unitDefinitions/mobile/queries/getMyUnits.js";
import type * as unitDefinitions_mobile_queries_getUnitDetails from "../unitDefinitions/mobile/queries/getUnitDetails.js";
import type * as unitDefinitions_mobile_queries_getUnitsByProperty from "../unitDefinitions/mobile/queries/getUnitsByProperty.js";
import type * as unitDefinitions_mobile_queries_index from "../unitDefinitions/mobile/queries/index.js";
import type * as user from "../user.js";
import type * as userDefinitions_index from "../userDefinitions/index.js";
import type * as userDefinitions_mobile_index from "../userDefinitions/mobile/index.js";
import type * as userDefinitions_mobile_queries_getCurrentUser from "../userDefinitions/mobile/queries/getCurrentUser.js";
import type * as userDefinitions_mobile_queries_index from "../userDefinitions/mobile/queries/index.js";
import type * as users from "../users.js";
import type * as usersDefinitions_web_index from "../usersDefinitions/web/index.js";
import type * as usersDefinitions_web_queries_getCurrentUser from "../usersDefinitions/web/queries/getCurrentUser.js";
import type * as usersDefinitions_web_queries_getUserById from "../usersDefinitions/web/queries/getUserById.js";
import type * as usersDefinitions_web_queries_getUsers from "../usersDefinitions/web/queries/getUsers.js";
import type * as webhook from "../webhook.js";
import type * as webhookDefinitions_handleUserCreated from "../webhookDefinitions/handleUserCreated.js";
import type * as webhookDefinitions_handleUserDeleted from "../webhookDefinitions/handleUserDeleted.js";
import type * as webhookDefinitions_handleUserUpdated from "../webhookDefinitions/handleUserUpdated.js";
import type * as webhookDefinitions_index from "../webhookDefinitions/index.js";
import type * as webhookDefinitions_verifyWebhook from "../webhookDefinitions/verifyWebhook.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  maintenance: typeof maintenance;
  "maintenanceDefinitions/index": typeof maintenanceDefinitions_index;
  "maintenanceDefinitions/mobile/index": typeof maintenanceDefinitions_mobile_index;
  "maintenanceDefinitions/mobile/mutations/cancelRequest": typeof maintenanceDefinitions_mobile_mutations_cancelRequest;
  "maintenanceDefinitions/mobile/mutations/createRequest": typeof maintenanceDefinitions_mobile_mutations_createRequest;
  "maintenanceDefinitions/mobile/mutations/deleteRequest": typeof maintenanceDefinitions_mobile_mutations_deleteRequest;
  "maintenanceDefinitions/mobile/mutations/index": typeof maintenanceDefinitions_mobile_mutations_index;
  "maintenanceDefinitions/mobile/mutations/tenantConfirmCompletion": typeof maintenanceDefinitions_mobile_mutations_tenantConfirmCompletion;
  "maintenanceDefinitions/mobile/mutations/updateRequest": typeof maintenanceDefinitions_mobile_mutations_updateRequest;
  "maintenanceDefinitions/mobile/queries/getMyCurrentRequests": typeof maintenanceDefinitions_mobile_queries_getMyCurrentRequests;
  "maintenanceDefinitions/mobile/queries/getRequestStatus": typeof maintenanceDefinitions_mobile_queries_getRequestStatus;
  "maintenanceDefinitions/mobile/queries/getRequests": typeof maintenanceDefinitions_mobile_queries_getRequests;
  "maintenanceDefinitions/mobile/queries/getRequestsById": typeof maintenanceDefinitions_mobile_queries_getRequestsById;
  "maintenanceDefinitions/mobile/queries/index": typeof maintenanceDefinitions_mobile_queries_index;
  "maintenanceDefinitions/web/mutations/assignTechnician": typeof maintenanceDefinitions_web_mutations_assignTechnician;
  "maintenanceDefinitions/web/mutations/bulkUpdateStatus": typeof maintenanceDefinitions_web_mutations_bulkUpdateStatus;
  "maintenanceDefinitions/web/mutations/updateMaintenanceCost": typeof maintenanceDefinitions_web_mutations_updateMaintenanceCost;
  "maintenanceDefinitions/web/mutations/updateMaintenanceStatus": typeof maintenanceDefinitions_web_mutations_updateMaintenanceStatus;
  "maintenanceDefinitions/web/queries/getMaintenanceKPIs": typeof maintenanceDefinitions_web_queries_getMaintenanceKPIs;
  "maintenanceDefinitions/web/queries/getMaintenanceRequests": typeof maintenanceDefinitions_web_queries_getMaintenanceRequests;
  "maintenanceDefinitions/web/queries/getMaintenanceTrends": typeof maintenanceDefinitions_web_queries_getMaintenanceTrends;
  "maintenanceDefinitions/web/queries/getManagerProperties": typeof maintenanceDefinitions_web_queries_getManagerProperties;
  "maintenanceDefinitions/web/queries/getTechnicianWorkload": typeof maintenanceDefinitions_web_queries_getTechnicianWorkload;
  "maintenanceDefinitions/web/queries/getTechnicians": typeof maintenanceDefinitions_web_queries_getTechnicians;
  "maintenanceDefinitions/web/queries/getUnitsByProperty": typeof maintenanceDefinitions_web_queries_getUnitsByProperty;
  noticeboard: typeof noticeboard;
  "noticeboardDefinitions/index": typeof noticeboardDefinitions_index;
  "noticeboardDefinitions/mobile/mutations/acknowledgeNotice": typeof noticeboardDefinitions_mobile_mutations_acknowledgeNotice;
  "noticeboardDefinitions/mobile/mutations/addEventToCalendar": typeof noticeboardDefinitions_mobile_mutations_addEventToCalendar;
  "noticeboardDefinitions/mobile/mutations/sendFeedback": typeof noticeboardDefinitions_mobile_mutations_sendFeedback;
  "noticeboardDefinitions/mobile/mutations/submitPollResponse": typeof noticeboardDefinitions_mobile_mutations_submitPollResponse;
  "noticeboardDefinitions/mobile/queries/getActivePolls": typeof noticeboardDefinitions_mobile_queries_getActivePolls;
  "noticeboardDefinitions/mobile/queries/getCommunityNews": typeof noticeboardDefinitions_mobile_queries_getCommunityNews;
  "noticeboardDefinitions/mobile/queries/getEvents": typeof noticeboardDefinitions_mobile_queries_getEvents;
  "noticeboardDefinitions/mobile/queries/getNoticeById": typeof noticeboardDefinitions_mobile_queries_getNoticeById;
  "noticeboardDefinitions/mobile/queries/getNotices": typeof noticeboardDefinitions_mobile_queries_getNotices;
  "noticeboardDefinitions/web/mutations/acknowledgeNotice": typeof noticeboardDefinitions_web_mutations_acknowledgeNotice;
  "noticeboardDefinitions/web/mutations/createNotice": typeof noticeboardDefinitions_web_mutations_createNotice;
  "noticeboardDefinitions/web/mutations/deleteNotice": typeof noticeboardDefinitions_web_mutations_deleteNotice;
  "noticeboardDefinitions/web/mutations/scheduleNotice": typeof noticeboardDefinitions_web_mutations_scheduleNotice;
  "noticeboardDefinitions/web/mutations/sendNoticeToAll": typeof noticeboardDefinitions_web_mutations_sendNoticeToAll;
  "noticeboardDefinitions/web/mutations/sendNoticeToUnit": typeof noticeboardDefinitions_web_mutations_sendNoticeToUnit;
  "noticeboardDefinitions/web/mutations/updateNotice": typeof noticeboardDefinitions_web_mutations_updateNotice;
  "noticeboardDefinitions/web/queries/getAllUnits": typeof noticeboardDefinitions_web_queries_getAllUnits;
  "noticeboardDefinitions/web/queries/getManagerProperties": typeof noticeboardDefinitions_web_queries_getManagerProperties;
  "noticeboardDefinitions/web/queries/getNoticeAcknowledgments": typeof noticeboardDefinitions_web_queries_getNoticeAcknowledgments;
  "noticeboardDefinitions/web/queries/getNoticeById": typeof noticeboardDefinitions_web_queries_getNoticeById;
  "noticeboardDefinitions/web/queries/getNotices": typeof noticeboardDefinitions_web_queries_getNotices;
  "noticeboardDefinitions/web/queries/getUnitsByProperty": typeof noticeboardDefinitions_web_queries_getUnitsByProperty;
  property: typeof property;
  "propertyDefinitions/index": typeof propertyDefinitions_index;
  "propertyDefinitions/mobile/index": typeof propertyDefinitions_mobile_index;
  "propertyDefinitions/mobile/queries/getMyProperties": typeof propertyDefinitions_mobile_queries_getMyProperties;
  "propertyDefinitions/mobile/queries/getProperties": typeof propertyDefinitions_mobile_queries_getProperties;
  "propertyDefinitions/mobile/queries/index": typeof propertyDefinitions_mobile_queries_index;
  "seeders/notice": typeof seeders_notice;
  "seeders/seed": typeof seeders_seed;
  tech: typeof tech;
  "techDefinitions/mobile/index": typeof techDefinitions_mobile_index;
  "techDefinitions/mobile/mutations/addMaintenancePhoto": typeof techDefinitions_mobile_mutations_addMaintenancePhoto;
  "techDefinitions/mobile/mutations/checkinAsset": typeof techDefinitions_mobile_mutations_checkinAsset;
  "techDefinitions/mobile/mutations/checkoutAsset": typeof techDefinitions_mobile_mutations_checkoutAsset;
  "techDefinitions/mobile/mutations/index": typeof techDefinitions_mobile_mutations_index;
  "techDefinitions/mobile/mutations/reportAssetIssue": typeof techDefinitions_mobile_mutations_reportAssetIssue;
  "techDefinitions/mobile/mutations/requestTenantApproval": typeof techDefinitions_mobile_mutations_requestTenantApproval;
  "techDefinitions/mobile/mutations/scheduleAssetMaintenance": typeof techDefinitions_mobile_mutations_scheduleAssetMaintenance;
  "techDefinitions/mobile/mutations/updateMaintenanceCost": typeof techDefinitions_mobile_mutations_updateMaintenanceCost;
  "techDefinitions/mobile/mutations/updateRequestStatus": typeof techDefinitions_mobile_mutations_updateRequestStatus;
  "techDefinitions/mobile/mutations/uploadMaintenancePhoto": typeof techDefinitions_mobile_mutations_uploadMaintenancePhoto;
  "techDefinitions/mobile/queries/getAssetInventory": typeof techDefinitions_mobile_queries_getAssetInventory;
  "techDefinitions/mobile/queries/getAssignedRequests": typeof techDefinitions_mobile_queries_getAssignedRequests;
  "techDefinitions/mobile/queries/getAvailableAssets": typeof techDefinitions_mobile_queries_getAvailableAssets;
  "techDefinitions/mobile/queries/getMaintenanceDashboard": typeof techDefinitions_mobile_queries_getMaintenanceDashboard;
  "techDefinitions/mobile/queries/getRequestDetails": typeof techDefinitions_mobile_queries_getRequestDetails;
  "techDefinitions/mobile/queries/index": typeof techDefinitions_mobile_queries_index;
  unit: typeof unit;
  "unitDefinitions/index": typeof unitDefinitions_index;
  "unitDefinitions/mobile/index": typeof unitDefinitions_mobile_index;
  "unitDefinitions/mobile/mutations/assignTenantToUnit": typeof unitDefinitions_mobile_mutations_assignTenantToUnit;
  "unitDefinitions/mobile/mutations/createAndAssignUnit": typeof unitDefinitions_mobile_mutations_createAndAssignUnit;
  "unitDefinitions/mobile/mutations/createUnit": typeof unitDefinitions_mobile_mutations_createUnit;
  "unitDefinitions/mobile/mutations/index": typeof unitDefinitions_mobile_mutations_index;
  "unitDefinitions/mobile/mutations/updateUnit": typeof unitDefinitions_mobile_mutations_updateUnit;
  "unitDefinitions/mobile/queries/getMyUnits": typeof unitDefinitions_mobile_queries_getMyUnits;
  "unitDefinitions/mobile/queries/getUnitDetails": typeof unitDefinitions_mobile_queries_getUnitDetails;
  "unitDefinitions/mobile/queries/getUnitsByProperty": typeof unitDefinitions_mobile_queries_getUnitsByProperty;
  "unitDefinitions/mobile/queries/index": typeof unitDefinitions_mobile_queries_index;
  user: typeof user;
  "userDefinitions/index": typeof userDefinitions_index;
  "userDefinitions/mobile/index": typeof userDefinitions_mobile_index;
  "userDefinitions/mobile/queries/getCurrentUser": typeof userDefinitions_mobile_queries_getCurrentUser;
  "userDefinitions/mobile/queries/index": typeof userDefinitions_mobile_queries_index;
  users: typeof users;
  "usersDefinitions/web/index": typeof usersDefinitions_web_index;
  "usersDefinitions/web/queries/getCurrentUser": typeof usersDefinitions_web_queries_getCurrentUser;
  "usersDefinitions/web/queries/getUserById": typeof usersDefinitions_web_queries_getUserById;
  "usersDefinitions/web/queries/getUsers": typeof usersDefinitions_web_queries_getUsers;
  webhook: typeof webhook;
  "webhookDefinitions/handleUserCreated": typeof webhookDefinitions_handleUserCreated;
  "webhookDefinitions/handleUserDeleted": typeof webhookDefinitions_handleUserDeleted;
  "webhookDefinitions/handleUserUpdated": typeof webhookDefinitions_handleUserUpdated;
  "webhookDefinitions/index": typeof webhookDefinitions_index;
  "webhookDefinitions/verifyWebhook": typeof webhookDefinitions_verifyWebhook;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
