import { createSlice } from '@reduxjs/toolkit';

import { useDispatch, useSelector } from 'react-redux';

import { isKey, useKeyDownListener } from './utils';

import { ReactState } from './types';

type State = {
  app: AppState;
};

type AppState = {
  runStripVisible: boolean;
  primarySidebarVisible: boolean;
};

const state0: AppState = {
  runStripVisible: true,
  primarySidebarVisible: true
};

const slice = createSlice({
  name: 'app',
  initialState: state0,
  reducers: {
    setRunStripVisible: (state, action) => {
      state.runStripVisible = action.payload;
    },
    setPrimarySidebarVisible: (state, action) => {
      state.primarySidebarVisible = action.payload;
    }
  }
});

export function useRunStripVisible(): ReactState<boolean> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.app.runStripVisible);
  const set = (val: boolean) => {
    dispatch(slice.actions.setRunStripVisible(val));
  };
  return [val, set];
}

export function usePrimarySidebarVisible(): ReactState<boolean> {
  const dispatch = useDispatch();
  const val = useSelector((state: State) => state.app.primarySidebarVisible);
  const set = (val: boolean) => {
    dispatch(slice.actions.setPrimarySidebarVisible(val));
  };
  return [val, set];
}

export function useAppInit() {
  useKeyboardBindings();
}

function useKeyboardBindings() {
  const [sidebar, setSidebar] = usePrimarySidebarVisible();
  const [runStrip, setRunStrip] = useRunStripVisible();

  useKeyDownListener([
    [e => isKey(e, { key: 'b', ctrl: true }), () => setSidebar(!sidebar)],
    [e => isKey(e, { key: ' ', ctrl: true }), () => setRunStrip(!runStrip)]
  ]);
}
export const reducer = slice.reducer;
