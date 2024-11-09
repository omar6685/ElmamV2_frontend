import { useQuery } from 'react-query';

import apiInstance from '@/lib/api/axios';
import { IGetActivity } from '@/lib/api/types';

export function useActivities(
  params: {
    page?: number;
    size?: number;
    search?: string;
    sort?: string;
    order?: string;
    entityId?: string;
  } = {}
) {
  return useQuery(
    ['activities', params],
    (): Promise<IGetActivity[] | undefined> =>
      apiInstance
        .get(`/activities`, {
          params,
        })
        .then((res) => res.data)
  );
}