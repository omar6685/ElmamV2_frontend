import { useQuery } from 'react-query';

import apiInstance from '@/lib/api/axios';
import { IGetNationalityReport } from '@/lib/api/types';

export function useGetNationalityReports() {
  return useQuery(
    ['nationality-reports'],
    (): Promise<IGetNationalityReport[] | undefined> => apiInstance.get(`/reports/nationality`).then((res) => res.data)
  );
}
