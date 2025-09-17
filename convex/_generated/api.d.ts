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
import type * as seeders_seed from "../seeders/seed.js";
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
  "seeders/seed": typeof seeders_seed;
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
