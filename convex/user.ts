import { query } from './_generated/server';
import { getCurrentUserArgs, getCurrentUserHandler } from './userDefinitions/mobile/queries/getCurrentUser';
import {
  webGetCurrentUserArgs,
  webGetCurrentUserHandler,
  webGetUserByIdArgs,
  webGetUserByIdHandler,
  webGetUsersArgs,
  webGetUsersReturns,
  webGetUsersHandler,
} from './userDefinitions/web/index';

// Web Queries
export const webGetCurrentUser = query({
  args: webGetCurrentUserArgs,
  handler: webGetCurrentUserHandler,
});

export const webGetUserById = query({
  args: webGetUserByIdArgs,
  handler: webGetUserByIdHandler,
});

export const webGetUsers = query({
  args: webGetUsersArgs,
  returns: webGetUsersReturns,
  handler: webGetUsersHandler,
});

// Mobile Queries
export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});
