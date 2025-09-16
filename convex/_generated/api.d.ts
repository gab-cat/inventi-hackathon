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
