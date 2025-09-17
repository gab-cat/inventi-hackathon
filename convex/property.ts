import { query } from './_generated/server';
import {
  getMyPropertiesArgs,
  getMyPropertiesHandler,
  getPropertiesArgs,
  getPropertiesHandler,
} from './propertyDefinitions';

export const getMyProperties = query({
  args: getMyPropertiesArgs,
  handler: getMyPropertiesHandler,
});

export const getProperties = query({
  args: getPropertiesArgs,
  handler: getPropertiesHandler,
});
