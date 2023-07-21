import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import queryString from 'query-string';

import { apiBaseUrl } from './prefs';

import {
  Archive,
  Collection,
  FileDiff,
  Run,
  RunComment,
  RunFile,
  RunFlags,
  RunProcessInfo,
  RunScalars,
  RunsCompare,
  RunsScalars,
  RunStatus
} from './types';

type RunsQueryParams = {
  status?: RunStatus | RunStatus[];
  run?: string | string[];
  op?: string | string[];
  started?: string | string[];
  collection?: string;
  text?: string;
  deleted?: null;
};

type OperationsQueryParams = {
  deleted?: null;
};

type DiffQueryParams = {
  lhs: string;
  rhs: string;
  maxlines?: number;
  force?: null;
}

export type OpName = 'delete' | 'restore' | 'purge';

export type RunsOp = {
  name: OpName;
  runIds: string[];
};

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    paramsSerializer: queryString.stringify
  }),
  tagTypes: ['Runs', 'Tags', 'Operations'],
  endpoints: builder => ({
    runs: builder.query<Run[], RunsQueryParams | undefined>({
      query: (params?) => ({ url: 'runs/', params }),
      providesTags: ['Runs']
    }),

    run: builder.query<Run, string>({
      query: runId => ({ url: `runs/${runId}` }),
      providesTags: ['Runs']
    }),

    runFlags: builder.query<RunFlags, string>({
      query: runId => `runs/${runId}/attrs/flags`
    }),

    runScalars: builder.query<RunScalars, string>({
      query: runId => `runs/${runId}/scalars`
    }),

    runFiles: builder.query<RunFile[], string>({
      query: runId => `runs/${runId}/files/`
    }),

    runComments: builder.query<RunComment[], string>({
      query: runId => `runs/${runId}/comments`
    }),

    runTags: builder.query<string[], string>({
      query: runId => `runs/${runId}/tags`,
      providesTags: ['Tags']
    }),

    runProcessInfo: builder.query<RunProcessInfo, string>({
      query: runId => `runs/${runId}/process-info`
    }),

    operations: builder.query<string[], OperationsQueryParams | undefined>({
      query: (params?) => ({ url: 'operations', params }),
      providesTags: ['Operations']
    }),

    runsCompare: builder.query<RunsCompare, RunsQueryParams | undefined>({
      query: (params?) => ({ url: 'compare', params })
    }),

    runsScalars: builder.query<RunsScalars, RunsQueryParams | undefined>({
      query: (params?) => ({ url: 'scalars', params })
    }),

    setRunLabel: builder.mutation<void, [string, string]>({
      query: ([runId, label]) => ({
        url: `runs/${runId}/label`,
        method: 'POST',
        body: JSON.stringify(label)
      }),
      invalidatesTags: ['Runs']
    }),

    setRunTags: builder.mutation<void, [string, string[]]>({
      query: ([runId, tags]) => ({
        url: `runs/${runId}/tags`,
        method: 'POST',
        body: JSON.stringify(tags)
      }),
      invalidatesTags: ['Tags', 'Runs']
    }),

    collections: builder.query<Collection[], undefined>({
      query: () => 'collections'
    }),

    archives: builder.query<Archive[], undefined>({
      query: () => 'archives'
    }),

    runsOp: builder.mutation<void, RunsOp>({
      query: op => ({
        url: `runs/`,
        method: 'POST',
        body: JSON.stringify(op)
      }),
      invalidatesTags: ['Runs', 'Operations']
    }),

    diff: builder.query<FileDiff, DiffQueryParams>({
      query: (params) => ({ url: 'diff', params })
    })
  })
});

export const runsApi = api.endpoints.runs;
export const runApi = api.endpoints.run;
export const runFlagsApi = api.endpoints.runFlags;
export const runScalarsApi = api.endpoints.runScalars;
export const runFilesApi = api.endpoints.runFiles;
export const runCommentsApi = api.endpoints.runComments;
export const runTagsApi = api.endpoints.runTags;
export const runProcessInfoApi = api.endpoints.runProcessInfo;
export const operationsApi = api.endpoints.operations;
export const runsCompareApi = api.endpoints.runsCompare;
export const runsScalarsApi = api.endpoints.runsScalars;
export const setRunLabelApi = api.endpoints.setRunLabel;
export const setRunTagsApi = api.endpoints.setRunTags;
export const collectionsApi = api.endpoints.collections;
export const archivesApi = api.endpoints.archives;
export const runsOpApi = api.endpoints.runsOp;
export const diffApi = api.endpoints.diff;

// Direct use of `fetch()` APIs
export const runFileApi = {
  fetch: (runId: string, path: string) =>
    fetch(`${apiBaseUrl}runs/${runId}/files/${path}`)
};

export const reducer = api.reducer;
export const middleware = api.middleware;
