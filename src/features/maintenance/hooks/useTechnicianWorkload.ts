import { useQuery } from 'convex/react';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

import { TechnicianWorkload } from '../types';

export function useTechnicianWorkload(propertyId?: Id<'properties'>) {
  return useQuery(api.maintenance.getTechnicianWorkload, { propertyId }) as TechnicianWorkload[] | undefined;
}
