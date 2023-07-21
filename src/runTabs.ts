import React from 'react';

import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { useCurrentRun, useSelectedRuns } from './runs';
import { useMainView } from './mainView';

import { isKey, useKeyDownListener } from './utils';

import { Run } from './types';

type State = {
  runTabs: RunTabsState;
};

export type RunTab = {
  label: string;
  value: string;
  canClose: boolean;
};

type RunTabs = {
  current: string | undefined;
  tabs: RunTab[];
};

type RunTabsState = {
  runTabs: { [runId: string]: RunTabs };
  selectedRunIds: string[];
  currentRunId: string | undefined;
};

const state0: RunTabsState = {
  runTabs: {},
  selectedRunIds: [],
  currentRunId: undefined
};

const slice = createSlice({
  name: 'runTabs',
  initialState: state0,
  reducers: {
    setCurrent: (state, action) => {
      const { run, value } = action.payload;
      setCurrentTab(state, run.id, value);
      syncSelected(state, run.id);
    },

    close: (state, action) => {
      const { run, value } = action.payload;
      closeTab(state, run.id, value);
      syncSelected(state, run.id);
    },

    closeCurrent: (state, action) => {
      const run = action.payload;
      closeCurrentTab(state, run.id);
    },

    open: (state, action) => {
      const { run, tab } = action.payload;
      openTab(state, run.id, tab);
      syncSelected(state, run.id);
    },

    setSelectedRuns: (state, action) => {
      state.selectedRunIds = action.payload;
      if (state.currentRunId) {
        syncSelected(state, state.currentRunId);
      }
    },

    setCurrentRun: (state, action) => {
      state.currentRunId = action.payload;
    }
  }
});

function setCurrentTab(state: RunTabsState, runId: string, value: string) {
  const runTabs = state.runTabs[runId] || DefaultRunTabs;
  state.runTabs[runId] = { ...runTabs, current: value };
}

function openTab(state: RunTabsState, runId: string, tab: RunTab) {
  const runTabs = state.runTabs[runId] || DefaultRunTabs;
  state.runTabs[runId] = {
    current: tab.value,
    tabs: appendedNeededTab(tab, runTabs.tabs)
  };
}

function appendedNeededTab(tab: RunTab, tabs: RunTab[]): RunTab[] {
  const exists = tabs.find(t => t.value === tab.value);
  return [...tabs, ...(exists ? [] : [tab])];
}

function closeTab(state: RunTabsState, runId: string, value: string) {
  const runTabs = state.runTabs[runId];
  if (!runTabs) {
    return;
  }
  const [tabs, current] = removeTab(value, runTabs);
  state.runTabs[runId] = {
    current,
    tabs
  };
}

function closeCurrentTab(state: RunTabsState, runId: string) {
  const runTabs = state.runTabs[runId];
  if (!runTabs || !runTabs.current) {
    return;
  }
  const [tabs, current] = removeTab(runTabs.current, runTabs);
  state.runTabs[runId] = {
    current,
    tabs
  };
}

function removeTab(
  value: string,
  runTabs: RunTabs
): [RunTab[], string | undefined] {
  const index = runTabs.tabs.findIndex(t => t.value === value);
  if (index === -1) {
    return [runTabs.tabs, runTabs.current];
  }
  const nextTabs = runTabs.tabs.filter(t => t.value !== value);
  return [nextTabs, FilesTab.value];
}

function syncSelected(state: RunTabsState, refRunId: string) {
  const refTabs = state.runTabs[refRunId];
  state.selectedRunIds.forEach(runId => {
    if (runId !== refRunId) {
      state.runTabs[runId] = refTabs;
    }
  });
}

const FilesTab: RunTab = {
  label: 'Files',
  value: 'files',
  canClose: false
};

const OutputTab: RunTab = {
  label: 'Output',
  value: 'output',
  canClose: false
};

export function useAppInit() {
  useKeyboardBindings();
  useSelectedRunsTabSync();
}

function useKeyboardBindings() {
  const dispatch = useDispatch();
  const run = useCurrentRun();
  const [view] = useMainView();

  useKeyDownListener([
    [
      e => isKey(e, { key: 'w', alt: true }),
      () => {
        if (run && view === 'run') {
          dispatch(slice.actions.closeCurrent(run));
        }
      }
    ]
  ]);
}

function useSelectedRunsTabSync() {
  const dispatch = useDispatch();
  const [selectedRuns] = useSelectedRuns();
  const currentRun = useCurrentRun();

  React.useEffect(() => {
    // Order is important here for sync - current must be set before selected to
    // avoid  propagating tabs from an old current to new selected.
    dispatch(
      slice.actions.setCurrentRun(currentRun ? currentRun.id : undefined)
    );
    dispatch(slice.actions.setSelectedRuns(selectedRuns.map(run => run.id)));
  }, [dispatch, selectedRuns, currentRun]);
}

const DefaultRunTabs = { current: FilesTab.value, tabs: [] };

const BaseTabs = [FilesTab, OutputTab];

export function RunFileTab(path: string): RunTab {
  return { label: path, value: `file:${path}`, canClose: true };
}

export function useRunTabs(
  run: Run | undefined
): [
  RunTab | undefined,
  RunTab[],
  (arg0: string) => void,
  (arg0: string) => void,
  (arg0: RunTab) => void
] {
  const runTabsState = useSelector((state: State) => state.runTabs);
  const dispatch = useDispatch();
  if (!run) {
    return [undefined, [], () => {}, () => {}, () => {}];
  }
  const runTabs = runTabsState.runTabs[run.id] || DefaultRunTabs;
  const allTabs = [...BaseTabs, ...runTabs.tabs];
  const current = allTabs.find(tab => tab.value === runTabs.current);
  const select = (value: any) => {
    dispatch(slice.actions.setCurrent({ run, value }));
  };
  const close = (value: string) => {
    dispatch(slice.actions.close({ run, value }));
  };
  const open = (tab: RunTab) => {
    dispatch(slice.actions.open({ run, tab }));
  };
  return [current, allTabs, select, close, open];
}

export function useCurrentRunTab(
  run: Run | undefined
): [string | undefined, (arg0: string) => void] {
  const [current, , select] = useRunTabs(run);

  return [current?.value, select];
}

export const reducer = slice.reducer;
