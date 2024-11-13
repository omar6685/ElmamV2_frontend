import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ReportsPage } from '@/components/dashboard/reports/reports-page';

export const metadata = { title: `List | Reports | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: { email?: string; phone?: string; sortDir?: 'asc' | 'desc'; status?: string };
}

export default function Page({ searchParams }: PageProps): React.JSX.Element {
  return <ReportsPage searchParams={searchParams} />;
}
