'use client';

import * as React from 'react';
import { Grid } from '@mui/system';

import { ReportCard } from '@/components/dashboard/reports/report-card';

import { reports } from './_data';

export default function ReportsList(): React.JSX.Element {
  return (
    <Grid container spacing={4}>
      {reports?.map((report) => (
        <Grid
          key={report.name}
          size={{
            md: 3,
            xs: 12,
          }}
        >
          <ReportCard
            icon={report.icon}
            title={report.name}
            description={report.description}
            href={report.href}
            soon={report.soon}
          />
        </Grid>
      ))}
    </Grid>
  );
}
