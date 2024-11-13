'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';

import { paths } from '@/paths';
import { IGetNationalityReport } from '@/lib/api/types';
import { dayjs } from '@/lib/dayjs';
import { DataTable } from '@/components/core/data-table';
import type { ColumnDef } from '@/components/core/data-table';

import { useReportsSelection } from './reports-selection-context';

const columns = [
  {
    name: 'Report',
    formatter: (row: IGetNationalityReport) => {
      return (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2">{row.name}</Typography>
        </Stack>
      );
    },
  },
  {
    name: 'Companies',
    formatter: (row: IGetNationalityReport) => {
      return (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2">{row.companies}</Typography>
        </Stack>
      );
    },
  },
  {
    name: 'Type',
    formatter: (row: IGetNationalityReport) => {
      return <Typography variant="body2">Nationality</Typography>;
    },
  },
  {
    name: 'Number',
    formatter: (row: IGetNationalityReport) => {
      return <Typography variant="body2">{row.totalEmployees}</Typography>;
    },
  },
  {
    name: 'Creation date',
    formatter: (row: IGetNationalityReport) => {
      return <Typography variant="body2">{dayjs(row.createdAt).format('DD/MM/YYYY')}</Typography>;
    },
  },
  {
    name: 'Actions',
    formatter: (row: IGetNationalityReport) => {
      return (
        <Stack direction="row" spacing={1}>
          <IconButton component={RouterLink} href={'/dashboard/reports/nationality/' + row.id} size="small">
            <ArrowSquareOut />
          </IconButton>
        </Stack>
      );
    },
  },
] satisfies ColumnDef<IGetNationalityReport>[];

export interface ReportsTableProps {
  rows: IGetNationalityReport[];
}

export function ReportsTable({ rows }: ReportsTableProps): React.JSX.Element {
  const { deselectAll, deselectOne, selectAll, selectOne, selected } = useReportsSelection();

  return (
    <React.Fragment>
      <DataTable<IGetNationalityReport>
        columns={columns}
        onDeselectAll={deselectAll}
        onDeselectOne={(_, row) => {
          deselectOne(row.id);
        }}
        onSelectAll={selectAll}
        onSelectOne={(_, row) => {
          selectOne(row.id);
        }}
        rows={rows}
        selectable
        selected={selected}
      />
      {!rows.length ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            No reports found
          </Typography>
        </Box>
      ) : null}
    </React.Fragment>
  );
}
