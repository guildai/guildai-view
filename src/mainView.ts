import React from 'react';

import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { defaultMainView } from './prefs';
import { RunsSource, useRunsSource } from './runs';
import { useSetCompareMode } from './selection';

import { assert, isKey, useKeyDownListener } from './utils';

import { ReactState } from './types';

type State = {
  mainView: MainViewState;
};

export type MainViewName = 'grid' | 'table' | 'run' | 'compare' | 'summaries';

type MainViewState = {
  current: MainViewName;
};

const state0: MainViewState = {
  current: defaultMainView
};

const slice = createSlice({
  name: 'mainView',
  initialState: state0,
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload;
    }
  }
});

export function useMainView(): ReactState<MainViewName> {
  const view = useSelector((state: State) => state.mainView.current);
  const dispatch = useDispatch();

  const setView = (view: MainViewName) => {
    dispatch(slice.actions.setCurrent(view));
  };
  return [view, setView];
}

export function filterViewForSource(
  view: MainViewName,
  source: RunsSource
): boolean {
  if (['local'].includes(source.type)) {
    return true;
  } else {
    return ['grid', 'table', 'run'].includes(view);
  }
}

export function useAppInit() {
  useKeyboardBindings();
  useDeletedRunsGridViewSync();
  useCompareModeSync();
  useMainViewForSourceSync();
}

function useKeyboardBindings() {
  const dispatch = useDispatch();
  useKeyDownListener([
    [e => isKey(e, 'g'), () => dispatch(slice.actions.setCurrent('grid'))],
    [e => isKey(e, 't'), () => dispatch(slice.actions.setCurrent('table'))],
    [e => isKey(e, 'r'), () => dispatch(slice.actions.setCurrent('run'))],
    [e => isKey(e, 'c'), () => dispatch(slice.actions.setCurrent('compare'))],
    [e => isKey(e, 's'), () => dispatch(slice.actions.setCurrent('summaries'))]
  ]);
}

function useDeletedRunsGridViewSync() {
  const view = useSelector((state: State) => state.mainView.current);
  const [source] = useRunsSource();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (source.type === 'local-deleted' && !filterViewForSource(view, source)) {
      dispatch(slice.actions.setCurrent('grid'));
    }
  }, [source, view, dispatch]);
}

function useCompareModeSync() {
  const view = useSelector((state: State) => state.mainView.current);
  const setCompareMode = useSetCompareMode();

  React.useEffect(() => {
    setCompareMode(view === 'compare');
  }, [view, setCompareMode]);
}

function useMainViewForSourceSync() {
  const [source] = useRunsSource();
  const [view, setView] = useMainView();

  React.useEffect(() => {
    if (!filterViewForSource(view, source)) {
      assert(filterViewForSource('grid', source), [source]);
      setView('grid');
    }
  }, [source, view, setView]);
}

export const reducer = slice.reducer;
