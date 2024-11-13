import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { paths } from '@/paths';
import { IGetNationalityReport } from '@/lib/api/types';
import { dayjs } from '@/lib/dayjs';
import { ReportsFilters } from '@/components/dashboard/reports/reports-filters';
import type { Filters } from '@/components/dashboard/reports/reports-filters';
import { ReportsPagination } from '@/components/dashboard/reports/reports-pagination';
import { ReportsSelectionProvider } from '@/components/dashboard/reports/reports-selection-context';

export const metadata = { title: `List | Reports | Dashboard | ${config.site.name}` } satisfies Metadata;

const reports = [
  {
    id: '3',
    result: 'هندي,31,48.44%,فلبيني,1,1.56%,نيبالي,7,10.94%,باكستاني,4,6.25%,مصرى,5,7.81%,يمني,15,23.44%,سوداني,1,1.56%',
    saudis: 8,
    totalEmployees: 72,
    maxAddition: '{"هندي":0,"فلبيني":6,"نيبالي":0,"باكستاني":3,"مصرى":2,"سعودي":19,"يمني":0,"سوداني":6}',
    name: 'Report-1731342653822',
    userId: '3',
    createdAt: '2024-11-11T15:30:53.822Z',
    updatedAt: '2024-11-11T15:30:53.822Z',
    entityId: '13',
  },
  {
    id: '4',
    result: 'هندي,31,48.44%,فلبيني,1,1.56%,نيبالي,7,10.94%,باكستاني,4,6.25%,مصرى,5,7.81%,يمني,15,23.44%,سوداني,1,1.56%',
    saudis: 8,
    totalEmployees: 72,
    maxAddition: '{"هندي":0,"فلبيني":6,"نيبالي":0,"باكستاني":3,"مصرى":2,"سعودي":19,"يمني":0,"سوداني":6}',
    name: 'Report-1731342914985',
    userId: '3',
    createdAt: '2024-11-11T15:35:14.985Z',
    updatedAt: '2024-11-11T15:35:14.985Z',
    entityId: '13',
  },
  {
    id: '5',
    result: 'هندي,31,48.44%,فلبيني,1,1.56%,نيبالي,7,10.94%,باكستاني,4,6.25%,مصرى,5,7.81%,يمني,15,23.44%,سوداني,1,1.56%',
    saudis: 8,
    totalEmployees: 72,
    maxAddition: '{"هندي":0,"فلبيني":6,"نيبالي":0,"باكستاني":3,"مصرى":2,"سعودي":19,"يمني":0,"سوداني":6}',
    name: 'Report-1731344006106',
    userId: '3',
    createdAt: '2024-11-11T15:53:26.108Z',
    updatedAt: '2024-11-11T15:53:26.108Z',
    entityId: '13',
  },
];

interface PageProps {
  searchParams: { email?: string; phone?: string; sortDir?: 'asc' | 'desc'; status?: string };
}

export default function Page({ searchParams }: PageProps): React.JSX.Element {
  const { email, phone, sortDir, status } = searchParams;

  const sortedReports = applySort(reports as IGetNationalityReport[], sortDir);
  const filteredReports = applyFilters(sortedReports, { email, phone, status });

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Reports</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={paths.dashboard.reports.create}>
              <Button startIcon={<PlusIcon />} variant="contained">
                Create report
              </Button>
            </Link>
          </Box>
        </Stack>
        <ReportsSelectionProvider reports={filteredReports}>
          <Card>
            <ReportsFilters filters={{ email, phone, status }} sortDir={sortDir} />
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>{/* <ReportsTable rows={filteredReports} /> */}</Box>
            <Divider />
            <ReportsPagination count={filteredReports.length + 100} page={0} />
          </Card>
        </ReportsSelectionProvider>
      </Stack>
    </Box>
  );
}

// Sorting and filtering has to be done on the server.

function applySort(row: IGetNationalityReport[], sortDir: 'asc' | 'desc' | undefined): IGetNationalityReport[] {
  return row.sort((a, b) => {
    if (sortDir === 'asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function applyFilters(row: IGetNationalityReport[], { email, phone, status }: Filters): IGetNationalityReport[] {
  return row.filter((item) => {
    // if (email) {
    //   if (!item.email?.toLowerCase().includes(email.toLowerCase())) {
    //     return false;
    //   }
    // }

    // if (phone) {
    //   if (!item.phone?.toLowerCase().includes(phone.toLowerCase())) {
    //     return false;
    //   }
    // }

    // if (status) {
    //   if (item.status !== status) {
    //     return false;
    //   }
    // }

    return true;
  });
}
