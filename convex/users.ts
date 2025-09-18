import { query } from './_generated/server';
import { getUsersArgs, getUsersHandler, getUsersReturns } from './usersDefinitions/web/queries/getUsers';
import { getUserByIdArgs, getUserByIdHandler } from './usersDefinitions/web/queries/getUserById';

// Queries
export const getUserById = query({
  args: getUserByIdArgs,
  handler: getUserByIdHandler,
});

export const getUsers = query({
  args: getUsersArgs,
  returns: getUsersReturns,
  handler: getUsersHandler,
});

// Mutations
