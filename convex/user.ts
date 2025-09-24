import { query } from './_generated/server';
import { getCurrentUserArgs, getCurrentUserHandler } from './userDefinitions/mobile/queries/getCurrentUser';
import { getUserPropertiesArgs, getUserPropertiesHandler, getUserPropertiesReturns } from './userDefinitions';
import {
  webGetCurrentUserArgs,
  webGetCurrentUserHandler,
  webGetUserByIdArgs,
  webGetUserByIdHandler,
  webGetUsersArgs,
  webGetUsersReturns,
  webGetUsersHandler,
  webGetUsersByPropertyAndUnitArgs,
  webGetUsersByPropertyAndUnitReturns,
  webGetUsersByPropertyAndUnitHandler,
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

export const webGetUsersByPropertyAndUnit = query({
  args: webGetUsersByPropertyAndUnitArgs,
  returns: webGetUsersByPropertyAndUnitReturns,
  handler: webGetUsersByPropertyAndUnitHandler,
});

// Mobile Queries
export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});

export const getUserProperties = query({
  args: getUserPropertiesArgs,
  returns: getUserPropertiesReturns,
  handler: getUserPropertiesHandler,
});
