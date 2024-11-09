import { useQuery } from 'react-query';

import apiInstance from '@/lib/api/axios';
import { IGetActivity } from '@/lib/api/types';

export function useActivities() {
  return useQuery(
    'activities',
    (): Promise<IGetActivity[] | undefined> => apiInstance.get(`/activities`).then((res) => res.data)
  );
}
