import { defineSchema, defineTable } from 'convex/server';
import { users } from './usersDefinitions/users.model';

const schema = defineSchema({
  users,
});
