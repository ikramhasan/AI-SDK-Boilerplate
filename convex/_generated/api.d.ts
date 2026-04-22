/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiConfig from "../aiConfig.js";
import type * as auth from "../auth.js";
import type * as chats from "../chats.js";
import type * as documentAssets from "../documentAssets.js";
import type * as feedback from "../feedback.js";
import type * as knowledgeFiles from "../knowledgeFiles.js";
import type * as mcpServers from "../mcpServers.js";
import type * as messages from "../messages.js";
import type * as models from "../models.js";
import type * as usage from "../usage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiConfig: typeof aiConfig;
  auth: typeof auth;
  chats: typeof chats;
  documentAssets: typeof documentAssets;
  feedback: typeof feedback;
  knowledgeFiles: typeof knowledgeFiles;
  mcpServers: typeof mcpServers;
  messages: typeof messages;
  models: typeof models;
  usage: typeof usage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
