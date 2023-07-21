import { useFilteredRuns, useSelectedRuns } from './runs';
import { runsCompareApi, runsScalarsApi } from './api';

import { Run, RunsCompare, RunsScalars } from './types';

function useRunsForSummaries() {
  const [selected] = useSelectedRuns();
  const filtered = useFilteredRuns();
  return selected.length ? selected : filtered;
}

export function useSummariesCompare(): RunsCompare | undefined {
  const runs = useRunsForSummaries();
  const params = {
    run: runs.map(run => run.id)
  };
  const { data } = runsCompareApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ data })
  });
  return data;
}

export function useScalarNames(): string[] {
  const compare = useSummariesCompare();
  return scalarNames(compare);
}

function scalarNames(compare: RunsCompare | undefined): string[] {
  if (!compare) {
    return [];
  }
  const scalars = new Set<string>();
  Object.keys(compare).forEach(runId => {
    Object.keys(compare[runId].scalars).forEach(scalar => {
      scalars.add(scalar);
    });
  });
  return Array.from(scalars).sort();
}

export function useSummariesScalars(): [
  RunsScalars | undefined,
  { [key: string]: Run }
] {
  const runs = useRunsForSummaries();
  const params = {
    run: runs.map(run => run.id)
  };
  const { data } = runsScalarsApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ data })
  });
  const runLookup = Object.fromEntries(runs.map(run => [run.id, run]));
  return [data, runLookup];
}
