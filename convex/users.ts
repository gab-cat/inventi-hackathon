import { query } from './_generated/server';
import { getUsersPaginatedArgs, getUsersPaginatedHandler } from './usersDefinitions/web';

// Queries
export const getAllUsers = query({
  args: getUsersPaginatedArgs,
  handler: getUsersPaginatedHandler,
});

// Mutations
