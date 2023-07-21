import EmptyView from './components/EmptyView';
import ParagraphButton from './components/ParagraphButton';

import { useClearFilters, useCollection, useRunsRefresh } from './runs';

function ClearFilterButton() {
  const [, clearFilters] = useClearFilters();

  return (
    <ParagraphButton onClick={clearFilters} >
      Clear Filter
    </ParagraphButton>
  );
}

function RefreshButton() {
  const refreshRuns = useRunsRefresh();

  return (
    <ParagraphButton onClick={refreshRuns} >
      Refresh
    </ParagraphButton>
  );
}

function ClearCollectionButton() {
  const [, setCollection] = useCollection();

  return (
    <ParagraphButton onClick={() => setCollection(null)}>
      Show All Runs
    </ParagraphButton>
  );
}

export default function NoRunsView() {
  const [activeFilters] = useClearFilters();
  const [collection] = useCollection();

  return activeFilters ? (
    <EmptyView>
      No runs match the current filter <RefreshButton /> <ClearFilterButton />
    </EmptyView>
  ) : collection ? (
    <EmptyView>
      No runs match the current collection <strong>{collection.label}</strong>{' '}
      <RefreshButton /> <ClearCollectionButton />
    </EmptyView>
  ) : (
    <EmptyView>
      Waiting for runs
      <RefreshButton />
    </EmptyView>
  );
}
