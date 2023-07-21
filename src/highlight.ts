import { useSelector, useDispatch } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';

import { ReactState } from './types';

type HighlightState = {
  highlighted: string[];
  hover: string | null;
};

type State = {
  highlight: HighlightState;
};

const state0: HighlightState = {
  highlighted: [],
  hover: null
};

const slice = createSlice({
  name: 'highlight',
  initialState: state0,

  reducers: {
    setHighlighted: (state, action) => {
      state.highlighted = action.payload;
    },

    setHover: (state, action) => {
      state.hover = action.payload;
    }
  }
});

export const reducer = slice.reducer;

export function useHighlighted(): ReactState<string[]> {
  const dispatch = useDispatch();
  const highlighted = useSelector(
    (state: State) => state.highlight.highlighted
  );
  const set = (keys: string[]) => {
    dispatch(slice.actions.setHighlighted(keys));
  };
  return [highlighted, set];
}

export function useHover(): ReactState<string | null> {
  const dispatch = useDispatch();
  const hover = useSelector((state: State) => state.highlight.hover);
  const set = (key: string | null) => {
    dispatch(slice.actions.setHover(key));
  };
  return [hover, set];
}
