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
import type * as users from "../users.js";
import type * as usersDefinitions_web_index from "../usersDefinitions/web/index.js";
import type * as usersDefinitions_web_queries_getCurrentUser from "../usersDefinitions/web/queries/getCurrentUser.js";
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
  users: typeof users;
  "usersDefinitions/web/index": typeof usersDefinitions_web_index;
  "usersDefinitions/web/queries/getCurrentUser": typeof usersDefinitions_web_queries_getCurrentUser;
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
