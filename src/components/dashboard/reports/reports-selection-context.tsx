'use client';

import * as React from 'react';

import { useSelection } from '@/hooks/use-selection';
import type { Selection } from '@/hooks/use-selection';

import type { Report } from './reports-table';

function noop(): void {
  return undefined;
}

export interface ReportsSelectionContextValue extends Selection {}

export const ReportsSelectionContext = React.createContext<ReportsSelectionContextValue>({
  deselectAll: noop,
  deselectOne: noop,
  selectAll: noop,
  selectOne: noop,
  selected: new Set(),
  selectedAny: false,
  selectedAll: false,
});

interface ReportsSelectionProviderProps {
  children: React.ReactNode;
  reports: Report[];
}

export function ReportsSelectionProvider({
  children,
  reports = [],
}: ReportsSelectionProviderProps): React.JSX.Element {
  const reportIds = React.useMemo(() => reports.map((report) => report.id), [reports]);
  const selection = useSelection(reportIds);

  return <ReportsSelectionContext.Provider value={{ ...selection }}>{children}</ReportsSelectionContext.Provider>;
}

export function useReportsSelection(): ReportsSelectionContextValue {
  return React.useContext(ReportsSelectionContext);
}
