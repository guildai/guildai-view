import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';
import { TypedUseMutationResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';

import {
  useCurrent,
  useDeselect,
  useSelected,
  useSetAvailable
} from './selection';

import { useHover } from './highlight';

import {
  archivesApi,
  collectionsApi,
  diffApi,
  operationsApi,
  OpName,
  runApi,
  runCommentsApi,
  runFileApi,
  runFilesApi,
  runFlagsApi,
  runProcessInfoApi,
  runsApi,
  runScalarsApi,
  runsCompareApi,
  runsOpApi,
  runTagsApi,
  setRunLabelApi,
  setRunTagsApi
} from './api';

import {
  assertFailed,
  cmp,
  ensureLower,
  isImageType,
  runDurationSeconds,
  useRefreshListener
} from './utils';

import {
  Archive,
  Collection,
  FileDiff,
  ReactState,
  Refresh,
  Run,
  RunComment,
  RunFile,
  RunProcessInfo,
  RunScalars,
  RunSort,
  RunStatus,
  RunsCompare
} from './types';

type State = {
  runs: RunsState;
};

type RunsState = {
  sort: RunSort;
  filters: Filters;
  collection: Collection | null;
  source: RunsSource;
};

export type Filters = {
  status: RunStatus[];
  operation: string[];
  started: string | null;
  text: string | null;
};

export type RunsSourceType = 'local' | 'local-deleted' | 'local-archive';

export type RunsSource = {
  type: RunsSourceType;
  [attr: string]: any;
};

export type LocalRuns = { type: 'local' };

export type LocalDeletedRuns = { type: 'local-deleted' };

export type LocalArchiveRuns = { type: 'local-archive'; archive: Archive };

const state0: RunsState = {
  sort: { type: 'attr', name: 'started', desc: true },
  filters: {
    status: [],
    operation: [],
    started: null,
    text: null
  },
  collection: null,
  source: { type: 'local' }
};

const slice = createSlice({
  name: 'runs',
  initialState: state0,
  reducers: {
    setSort: (state, action) => {
      state.sort = action.payload;
    },

    setCollection: (state, action) => {
      state.collection = action.payload;
    },

    setRunSource: (state, action) => {
      const source: RunsSource = action.payload;
      state.source = source;
    },

    setStatusFilters: (state, action) => {
      state.filters.status = action.payload;
    },

    setStartedFilter: (state, action) => {
      state.filters.started = action.payload;
    },

    setOperationFilter: (state, action) => {
      state.filters.operation = action.payload;
    },

    setTextFilter: (state, action) => {
      state.filters.text = action.payload;
    }
  }
});

export const reducer = slice.reducer;

export function useSort(): ReactState<RunSort> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.sort);
  const set = (sort: RunSort) => {
    dispatch(slice.actions.setSort(sort));
  };
  return [val, set];
}

export function useCollection(): ReactState<Collection | null> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.collection);
  const set = (collection: Collection | null) => {
    dispatch(slice.actions.setCollection(collection));
  };
  return [val, set];
}

export function useCollections(): [Collection[] | undefined, Refresh] {
  const { collections } = collectionsApi.useQuery(undefined, {
    selectFromResult: ({ data }) => ({ collections: data })
  });
  const { refetch } = collectionsApi.useQuerySubscription(undefined);

  return [collections, refetch];
}

export function useArchives(): [Archive[] | undefined, Refresh] {
  const { archives } = archivesApi.useQuery(undefined, {
    selectFromResult: ({ data }) => ({ archives: data })
  });
  const { refetch } = archivesApi.useQuerySubscription(undefined);

  return [archives, refetch];
}

export function useRunsSource(): ReactState<RunsSource> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.source);

  const set = (source: RunsSource) => {
    dispatch(slice.actions.setRunSource(source));
  };

  return [val, set];
}

export function useStatusFilter(): ReactState<RunStatus[]> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.filters.status);
  const set = (filters: RunStatus[]) => {
    dispatch(slice.actions.setStatusFilters(filters));
  };
  return [val, set];
}

export function useStartedFilter(): ReactState<string | null> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.filters.started);
  const set = (filter: string | null) => {
    dispatch(slice.actions.setStartedFilter(filter));
  };
  return [val, set];
}

export function useOperationFilter(): ReactState<string[]> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.filters.operation);

  const set = (filter: string[]) => {
    dispatch(slice.actions.setOperationFilter(filter));
  };
  return [val, set];
}

export function useTextFilter(): ReactState<string | null> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.runs.filters.text);
  const set = (filter: string | null) => {
    dispatch(slice.actions.setTextFilter(filter));
  };
  return [val, set];
}

export function useClearFilters(): [boolean, Refresh] {
  const [statusFilter, setStatusFilter] = useStatusFilter();
  const [operationFilter, setOperationFilter] = useOperationFilter();
  const [startedFilter, setStartedFilter] = useStartedFilter();
  const [textFilter, setTextFilter] = useTextFilter();

  const activeFilters = Boolean(
    statusFilter.length || operationFilter.length || startedFilter || textFilter
  );

  const clearFilters = () => {
    setStatusFilter([]);
    setOperationFilter([]);
    setStartedFilter(null);
    setTextFilter(null);
  };

  return [activeFilters, clearFilters];
}

export function useCurrentRun(): Run | undefined {
  const current = useCurrent();
  const runs = useFilteredRuns();
  if (!current) {
    return undefined;
  }
  return runs.find(run => run.id === current) || undefined;
}

export function useHoverOrCurrentRun(): Run | undefined {
  const [hover] = useHover();
  const current = useCurrent();
  const runs = useFilteredRuns();
  const runId = hover || current;
  if (!runId) {
    return undefined;
  }
  return runs.find(run => run.id === runId) || undefined;
}

export function useFilteredRuns(): Run[] {
  const params = useRunsQueryParams();
  const { runs } = runsApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ runs: data })
  });
  return runs || [];
}

function useRunsQueryParams() {
  const collection = useSelector((state: State) => state.runs.collection);
  const source = useSelector((state: State) => state.runs.source);
  const filters = useSelector((state: State) => state.runs.filters);
  return {
    status: filters.status,
    op: filters.operation,
    started: filters.started ? [filters.started] : [],
    ...(collection ? { collection: collection.idPath } : {}),
    ...(filters.text ? { text: filters.text } : {}),
    ...(source.type === 'local-deleted' ? { deleted: null } : {}),
    ...(source.type === 'local-archive'
      ? { archive: (source as LocalArchiveRuns).archive.id }
      : {})
  };
}

export function useOrderedRuns(): Run[] {
  const runs = useFilteredRuns();
  const sort = useSelector((state: State) => state.runs.sort);
  const data = useRunsSortData(runs, sort);
  return sortRuns(runs, sort, data || {});
}

function useRunsSortData(runs: Run[], sort: RunSort): RunsCompare | undefined {
  const params = {
    run: runs.map(run => run.id)
  };
  const { data } = runsCompareApi.useQuery(params, {
    skip: sort.type === 'attr',
    selectFromResult: ({ data }) => ({ data })
  });
  return data;
}

function sortRuns(runs: Run[], sort: RunSort, data: RunsCompare): Run[] {
  return [...runs].sort(compareRunFn(sort, data));
}

function compareRunFn(sort: RunSort, data: RunsCompare) {
  const cmpLatest = (a: Run, b: Run) => (b.started || 0) - (a.started || 0);
  if (sort.type === 'attr') {
    if (sort.name === 'started') {
      return (a: Run, b: Run) => (sort.desc ? 1 : -1) * cmpLatest(a, b);
    } else {
      return (a: Run, b: Run) =>
        genCmp(
          attrForSort(a, sort.name),
          attrForSort(b, sort.name),
          sort.desc
        ) || cmpLatest(a, b);
    }
  } else if (sort.type === 'flag') {
    return (a: Run, b: Run) =>
      genCmp(
        flagForSort(a, sort.name, data),
        flagForSort(b, sort.name, data),
        sort.desc
      ) || cmpLatest(a, b);
  } else if (sort.type === 'scalar') {
    return (a: Run, b: Run) =>
      genCmp(
        scalarForSort(a, sort.name, data),
        scalarForSort(b, sort.name, data),
        sort.desc
      ) || cmpLatest(a, b);
  } else {
    assertFailed(sort);
  }
}

function attrForSort(run: Run, name: string): any {
  if (name === 'status') {
    return statusRank(run.status);
  } else if (name === 'duration') {
    return runDurationSeconds(run.started, run.stopped);
  } else if (name === 'started' || name === 'operation' || name === 'label') {
    return run[name];
  } else {
    assertFailed(name);
  }
}

function flagForSort(run: Run, name: string, data: RunsCompare): any {
  return data[run.id]?.flags[name];
}

function scalarForSort(run: Run, name: string, data: RunsCompare): any {
  return data[run.id]?.scalars[name]?.lastVal;
}

function genCmp(a: any, b: any, desc?: boolean): number {
  return cmp(ensureLower(a), ensureLower(b), desc);
}

function statusRank(status: string): number {
  const ranks: { [key: string]: number } = {
    running: 1,
    completed: 2,
    terminated: 3,
    error: 4,
    staged: 5,
    pending: 6
  };
  return ranks[status] || 999;
}

export function useSelectedRuns(): [Run[], Run | undefined] {
  const selected = useSelected();
  const current = useCurrent();
  const runs = useOrderedRuns();
  const selectedRuns = runs.filter(run => selected.has(run.id));
  const currentRun = current ? runs.find(run => run.id === current) : undefined;
  return [selectedRuns, currentRun];
}

export function useAppInit() {
  useKeyboardBindings();
  useAvailableSync();
  useFilteredSelectionSync();
}

function useKeyboardBindings() {
  const refresh = useRunsRefresh();
  useRefreshListener(refresh);
}

export function useRunsRefresh() {
  const params = useRunsQueryParams();
  const { refetch } = runsApi.useQuerySubscription(params);
  return refetch;
}

function useAvailableSync() {
  const setAvailable = useSetAvailable();
  const runs = useOrderedRuns();

  React.useEffect(() => {
    setAvailable(runs.map(run => run.id));
  }, [setAvailable, runs]);
}

function useFilteredSelectionSync() {
  const filtered = useFilteredRuns();
  const selected = useSelected();
  const deselect = useDeselect();

  return React.useEffect(() => {
    const filteredIds = new Set(filtered.map(run => run.id));
    deselect([...selected].filter(runId => !filteredIds.has(runId)));
  }, [filtered, selected, deselect]);
}

export function useRunFlags(run: Run | undefined) {
  const runId = run ? run.id : 'unused';
  const { flags } = runFlagsApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ flags: data }),
    skip: !run
  });
  return run ? flags : undefined;
}

export function runStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'terminated':
      return 'Terminated';
    case 'error':
      return 'Error';
    case 'running':
      return 'Running';
    case 'staged':
      return 'Staged';
    case 'pending':
      return 'Pending';
    default:
      return 'Unknown';
  }
}

export function useRunScalars(
  run: Run | undefined
): [RunScalars | undefined, Refresh] {
  const runId = run ? run.id : 'unused';
  const { scalars } = runScalarsApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ scalars: data }),
    skip: !run
  });
  const { refetch } = runScalarsApi.useQuerySubscription(
    run ? run.id : 'unused',
    { skip: !run }
  );
  return run ? [scalars, refetch] : [undefined, () => {}];
}

export function useRunFiles(
  run: Run | undefined
): [RunFile[] | undefined, Refresh] {
  const runId = run ? run.id : 'unused';
  const { files } = runFilesApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ files: data }),
    skip: !run
  });
  const { refetch } = runFilesApi.useQuerySubscription(
    run ? run.id : 'unused',
    { skip: !run }
  );
  return run ? [files, refetch] : [undefined, () => {}];
}

export type RunFileStatus = [Response | null, Blob | null];

export function useRunFile(
  run: Run,
  path: string,
  options?: { refetch?: any; skip?: boolean }
): [Blob | null, Response | null] {
  const [resp, setResp] = React.useState<Response | null>(null);
  const [file, setFile] = React.useState<Blob | null>(null);

  const skip = options?.skip;
  const refetch = options?.refetch;

  React.useEffect(() => {
    setResp(null);
    setFile(null);
    if (!skip) {
      runFileApi.fetch(run.id, path).then(resp => {
        setResp(resp);
        if (resp.ok) {
          resp.blob().then(blob => {
            setFile(blob);
          });
        }
      });
    }
  }, [setResp, setFile, skip, run.id, path, refetch]);

  return [file, resp];
}

export function useRunImages(run: Run): [RunFile[], Refresh] {
  const [files, refresh] = useRunFiles(run);
  return [(files || []).filter(f => isImageType(f.type)), refresh];
}

export function useRunTextFiles(run: Run): [RunFile[], Refresh] {
  const [files, refresh] = useRunFiles(run);
  return [
    (files || []).filter(f => f.isText && (f.mType === 'd' || f.mType === 'g')),
    refresh
  ];
}

export function useRunComments(
  run: Run | undefined
): [RunComment[] | undefined, Refresh] {
  const runId = run ? run.id : 'unused';
  const { comments } = runCommentsApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ comments: data }),
    skip: !run
  });
  const { refetch } = runCommentsApi.useQuerySubscription(
    run ? run.id : 'unused',
    { skip: !run }
  );
  return run ? [comments, refetch] : [undefined, () => {}];
}

export function useRunTags(
  run: Run | undefined
): [string[] | undefined, Refresh] {
  const runId = run ? run.id : 'unused';
  const { tags } = runTagsApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ tags: data }),
    skip: !run
  });
  const { refetch } = runTagsApi.useQuerySubscription(run ? run.id : 'unused', {
    skip: !run
  });
  return run ? [tags, refetch] : [undefined, () => {}];
}

export function useRunProcessInfo(
  run: Run | undefined
): [RunProcessInfo | undefined, Refresh] {
  const runId = run ? run.id : 'unused';
  const { info } = runProcessInfoApi.useQuery(runId, {
    selectFromResult: ({ data }) => ({ info: data }),
    skip: !run
  });
  const { refetch } = runProcessInfoApi.useQuerySubscription(
    run ? run.id : 'unused',
    {
      skip: !run
    }
  );
  return run ? [info, refetch] : [undefined, () => {}];
}

export function useOperations(): [string[] | undefined, Refresh] {
  const params = useOperationsQueryParams();
  const { operations } = operationsApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ operations: data })
  });
  const { refetch } = operationsApi.useQuerySubscription(undefined);

  return [operations, refetch];
}

function useOperationsQueryParams() {
  const source = useSelector((state: State) => state.runs.source);
  return source.type === 'local-deleted' ? { deleted: null } : undefined;
}

export function useRunsCompare(): RunsCompare | undefined {
  const runs = useFilteredRuns();
  const params = {
    run: runs.map(run => run.id)
  };
  const { data } = runsCompareApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ data })
  });
  return data;
}

export function useSetRunLabel(
  run: Run | undefined
): [
  (arg0: string) => void,
  string | undefined,
  TypedUseMutationResult<void, [string, string], any>
] {
  const [apiSetLabel, apiResult] = setRunLabelApi.useMutation();

  const setLabel = (label: string) => {
    if (run) {
      apiSetLabel([run.id, label]);
    }
  };

  const label = pendingLabel(apiResult, run);

  return [setLabel, label, apiResult];
}

function pendingLabel(
  apiResult: TypedUseMutationResult<void, [string, string], any>,
  run: Run | undefined
): string | undefined {
  const args = apiResult.originalArgs;
  if (!args || args[0] !== run?.id || apiResult.isError) {
    return undefined;
  }
  return args[1];
}

export function useSetRunTags(
  run: Run | undefined
): [
  (arg0: string[]) => void,
  string[] | undefined,
  TypedUseMutationResult<void, [string, string[]], any>
] {
  const [apiSetTags, apiResult] = setRunTagsApi.useMutation();

  const setTags = (tags: string[]) => {
    if (run) {
      apiSetTags([run.id, tags]);
    }
  };

  return [setTags, pendingTags(apiResult, run), apiResult];
}

function pendingTags(
  apiResult: TypedUseMutationResult<void, [string, string[]], any>,
  run: Run | undefined
): string[] | undefined {
  const args = apiResult.originalArgs;
  if (!args || args[0] !== run?.id || apiResult.isError) {
    return undefined;
  }
  return args[1];
}

export function useRun(runId: string): Run | undefined {
  const { run } = runApi.useQuery(runId, {
    selectFromResult: ({ data, error }) => {
      return { run: data };
    }
  });
  return run;
}

export function useDeleteSelectedRuns(): [boolean, Refresh, Run[]] {
  const canDelete = (runs: Run[]) =>
    runs.reduce((acc, run) => acc || run.status !== 'running', false);
  return useRunsOp('delete', canDelete);
}

function useRunsOp(
  name: OpName,
  opEnabledForRuns: (runs: Run[]) => boolean
): [boolean, Refresh, Run[]] {
  const [runs] = useSelectedRuns();
  const [runsOp] = runsOpApi.useMutation();

  const opEnabled = opEnabledForRuns(runs);

  const op = () => {
    const runIds = runs.map(run => run.id);
    runsOp({ name, runIds });
  };

  return [opEnabled, op, runs];
}

export function usePurgeSelectedRuns(): [boolean, Refresh, Run[]] {
  const canPurge = (runs: Run[]) => runs.length > 0;
  return useRunsOp('purge', canPurge);
}

export function useRestoreSelectedRuns(): [boolean, Refresh, Run[]] {
  const canRestore = (runs: Run[]) => runs.length > 0;
  return useRunsOp('restore', canRestore);
}

export function useDeleteRun(run: Run): [boolean, Refresh] {
  return useRunOp('delete', run, run.status !== 'running');
}

function useRunOp(
  name: OpName,
  run: Run,
  opEnabled: boolean
): [boolean, Refresh] {
  const [runsOp] = runsOpApi.useMutation();
  const deselect = useDeselect();

  const op = () => {
    runsOp({ name, runIds: [run.id] });
    deselect([run.id]);
  };

  return [opEnabled, op];
}

export function usePurgeRun(run: Run): [boolean, Refresh] {
  return useRunOp('purge', run, true);
}

export function useRestoreRun(run: Run): [boolean, Refresh] {
  return useRunOp('restore', run, true);
}

export function useRunFileDiff(
  lhs: Run,
  rhs: Run,
  path: string,
  force?: boolean
): [FileDiff | undefined, Refresh] {
  const params = {
    lhs: `${lhs.id}/${path}`,
    rhs: `${rhs.id}/${path}`,
    path,
    ...(force ? { force: null } : {})
  };

  const { diff } = diffApi.useQuery(params, {
    selectFromResult: ({ data }) => ({ diff: data })
  });

  const { refetch } = diffApi.useQuerySubscription(params);

  return [diff, refetch];
}
