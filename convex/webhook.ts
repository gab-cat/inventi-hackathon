import { mutation } from "./_generated/server";
import {
  handleUserCreatedArgs,
  handleUserCreatedHandler,
  handleUserUpdatedArgs,
  handleUserUpdatedHandler,
  handleUserDeletedArgs,
  handleUserDeletedHandler,
} from "./webhookDefinitions";

export const handleUserCreated = mutation({
  args: handleUserCreatedArgs,
  handler: handleUserCreatedHandler,
});

export const handleUserUpdated = mutation({
  args: handleUserUpdatedArgs,
  handler: handleUserUpdatedHandler,
});

export const handleUserDeleted = mutation({
  args: handleUserDeletedArgs,
  handler: handleUserDeletedHandler,
});