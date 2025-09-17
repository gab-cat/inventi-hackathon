import { query } from "./_generated/server";
import { getCurrentUserArgs, getCurrentUserHandler } from "./userDefinitions/mobile/queries/getCurrentUser";

export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});