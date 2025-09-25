import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

import { TechnicianWorkload } from '../types';

export function useTechnicianWorkload(propertyId?: Id<'properties'>) {
  return useAuthenticatedQuery(api.maintenance.webGetTechnicianWorkload, { propertyId }) as
    | TechnicianWorkload[]
    | undefined;
}
