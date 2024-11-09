'use client';

import * as React from 'react';

import { useSelection } from '@/hooks/use-selection';
import type { Selection } from '@/hooks/use-selection';

import type { Entity } from './entities-table';

function noop(): void {
  return undefined;
}

export interface EntitiesSelectionContextValue extends Selection {}

export const EntitiesSelectionContext = React.createContext<EntitiesSelectionContextValue>({
  deselectAll: noop,
  deselectOne: noop,
  selectAll: noop,
  selectOne: noop,
  selected: new Set(),
  selectedAny: false,
  selectedAll: false,
});

interface EntitiesSelectionProviderProps {
  children: React.ReactNode;
  entities: Entity[];
}

export function EntitiesSelectionProvider({
  children,
  entities = [],
}: EntitiesSelectionProviderProps): React.JSX.Element {
  const reportIds = React.useMemo(() => entities.map((report) => report.id), [entities]);
  const selection = useSelection(reportIds);

  return <EntitiesSelectionContext.Provider value={{ ...selection }}>{children}</EntitiesSelectionContext.Provider>;
}

export function useEntitiesSelection(): EntitiesSelectionContextValue {
  return React.useContext(EntitiesSelectionContext);
}
