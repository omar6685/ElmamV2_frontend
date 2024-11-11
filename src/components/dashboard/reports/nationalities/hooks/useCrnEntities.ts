import { useQuery } from 'react-query';

import apiInstance from '@/lib/api/axios';
import { IGetCrnEntity } from '@/lib/api/types';

export function useCrnEntities(
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
    ['companies', params],
    (): Promise<IGetCrnEntity[] | undefined> =>
      apiInstance
        .get(`/entities/crn-entity`, {
          params,
        })
        .then((res) => res.data)
  );
}