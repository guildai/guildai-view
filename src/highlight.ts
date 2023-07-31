import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';

import { ensureVisible } from './utils';

import { ReactState } from './types';

type HighlightState = {
  hover: string | null;
  selected: Map<string, Set<string>>;
  brushed: Map<string, [number, number]>;
};

type State = {
  highlight: HighlightState;
};

const state0: HighlightState = {
  hover: null,
  selected: new Map(),
  brushed: new Map()
};

const slice = createSlice({
  name: 'highlight',
  initialState: state0,

  reducers: {
    setHover: (state, action) => {
      state.hover = action.payload;
    },

    highlight: (state, action) => {
      const [group, keys] = action.payload;
      if (keys) {
        state.selected.set(group, new Set(keys));
      } else {
        state.selected.delete(group);
      }
    },

    clearHighlight: state => {
      state.selected.clear();
    },

    brush: (state, action) => {
      const [group, extent] = action.payload;
      if (extent) {
        state.brushed.set(group, extent);
      } else {
        state.brushed.delete(group);
      }
    },

    resetBrush: (state, action) => {
      const keep = action.payload;
      if (keep) {
        [...state.brushed.keys()].forEach(key => {
          if (keep.indexOf(key) === -1) {
            state.brushed.delete(key);
          }
        });
      }
    }
  }
});

export const reducer = slice.reducer;

export function useHover(): ReactState<string | null> {
  const dispatch = useDispatch();
  const hover = useSelector((state: State) => state.highlight.hover);
  const set = (key: string | null) => {
    dispatch(slice.actions.setHover(key));
  };
  return [hover, set];
}

export function useWantsToViewHover(key: string) {
  const hover = useSelector((state: State) => state.highlight.hover);
  return key === hover;
}

export function useScrollHoverIntoView(
  key: string,
  ref: React.RefObject<HTMLElement>
) {
  const wantsToView = useWantsToViewHover(key);

  React.useEffect(() => {
    if (wantsToView && ref.current) {
      ensureVisible(ref.current);
    }
  }, [wantsToView, ref]);
}

export function useHighlight(): (arg0: string, arg1: string[] | null) => void {
  const dispatch = useDispatch();

  const highlight = (group: string, keys: string[] | null) => {
    dispatch(slice.actions.highlight([group, keys]));
  };

  return highlight;
}

export function useIntersectHighlighted(): Set<string> | null {
  const selected = useSelector((state: State) => state.highlight.selected);
  return intersectHighlighted(selected);
}

function intersectHighlighted(
  selected: Map<string, Set<string>>
): Set<string> | null {
  return selected.size ? intersectGroups([...selected.values()]) : null;
}

function intersectGroups(groups: Set<string>[]): Set<string> {
  const group0 = groups[0];
  const restGroups = groups.slice(1);
  const inRest = (key: string) => restGroups.every(group => group.has(key));
  return new Set([...group0.values()].filter(inRest));
}

export function useHighlightBrush(
  group: string
): (arg0: [number, number] | null) => void {
  const dispatch = useDispatch();

  const brush = React.useCallback(
    (extent: [number, number] | null) => {
      dispatch(slice.actions.brush([group, extent]));
    },
    [group, dispatch]
  );

  return brush;
}

export function useHighlightBrushSelection(
  group: string
): [number, number] | null {
  const brushed = useSelector((state: State) => state.highlight.brushed);
  return brushed.get(group) || null;
}

export function useHighlightBrushReset(): (arg0: string[]) => void {
  const dispatch = useDispatch();

  const reset = (keep?: string[]) => {
    dispatch(slice.actions.resetBrush(keep));
  };

  return reset;
}
