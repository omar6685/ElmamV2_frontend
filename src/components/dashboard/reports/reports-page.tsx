'use client';

import * as React from 'react';
import Link from 'next/link';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { QueryClient, QueryClientProvider } from 'react-query';

import { config } from '@/config';
import { paths } from '@/paths';
import { IGetNationalityReport } from '@/lib/api/types';
import { dayjs } from '@/lib/dayjs';
import { useGetNationalityReports } from '@/components/dashboard/reports/nationalities/hooks/useGetNationalityReports';
import { ReportsFilters } from '@/components/dashboard/reports/reports-filters';
import type { Filters } from '@/components/dashboard/reports/reports-filters';
import { ReportsPagination } from '@/components/dashboard/reports/reports-pagination';
import { ReportsSelectionProvider } from '@/components/dashboard/reports/reports-selection-context';
import { ReportsTable } from '@/components/dashboard/reports/reports-table';

interface ReportsPageProps {
  searchParams: { email?: string; phone?: string; sortDir?: 'asc' | 'desc'; status?: string };
}

function Reports({ searchParams }: ReportsPageProps): React.JSX.Element {
  const { email, phone, sortDir, status } = searchParams;
  const { isLoading, error, data: nationalityReports, isFetching } = useGetNationalityReports();

  const sortedReports = applySort(nationalityReports as IGetNationalityReport[], sortDir);
  const filteredReports = applyFilters(sortedReports, { email, phone, status });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            {/* <ReportsFilters filters={{ email, phone, status }} sortDir={sortDir} /> */}
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <ReportsTable rows={nationalityReports ?? []} />
            </Box>
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
  return row?.sort((a, b) => {
    if (sortDir === 'asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function applyFilters(row: IGetNationalityReport[], { email, phone, status }: Filters): IGetNationalityReport[] {
  return row?.filter((item) => {
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

const queryClient = new QueryClient();

export function ReportsPage({ searchParams }: ReportsPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Reports searchParams={searchParams} />
    </QueryClientProvider>
  );
}
