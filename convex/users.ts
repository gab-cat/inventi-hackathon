import { query } from './_generated/server';
import { getUsersPaginatedArgs, getUsersPaginatedHandler } from './usersDefinitions/web';
import { getUserByIdArgs, getUserByIdHandler } from './usersDefinitions/web/queries/getUserById';

// Queries
export const getUserById = query({
  args: getUserByIdArgs,
  handler: getUserByIdHandler,
});

export const getAllUsers = query({
  args: getUsersPaginatedArgs,
  handler: getUsersPaginatedHandler,
});

// Mutations
