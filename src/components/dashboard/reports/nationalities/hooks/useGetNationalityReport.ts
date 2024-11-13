import { useQuery } from 'react-query';

import apiInstance from '@/lib/api/axios';
import { IGetNationalityReport } from '@/lib/api/types';

export function useGetNationalityReport(params: { id: string }) {
  return useQuery(
    ['single-nationality-report', params],
    (): Promise<IGetNationalityReport | undefined> =>
      apiInstance.get(`/reports/nationality/${params.id}`).then((res) => res.data)
  );
}
