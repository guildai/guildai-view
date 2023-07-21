import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';

import { assert, ensureVisible, isKey, useKeyDownListener } from './utils';
import { ReactState } from './types';

type ExtendSide = 'left' | 'right' | null;

type SelectionState = {
  available: string[];
  selected: Set<string>;
  current: string | null;
  extendSide: ExtendSide;
  compareMode: boolean;
  compare: string | null;
};

type State = {
  selection: SelectionState;
};

type Step = 1 | -1;

const state0: SelectionState = {
  available: [],
  selected: new Set(),
  current: null,
  extendSide: null,
  compareMode: false,
  compare: null
};

const slice = createSlice({
  name: 'selection',
  initialState: state0,

  reducers: {
    setAvailable: (state, action) => {
      setAvailable(state, action.payload);
    },

    setSelected: (state, action) => {
      if (action.payload.length === 1) {
        const keys = action.payload;
        setAllSelected(state, keys);
      } else if (action.payload.length === 2) {
        const [key, selected] = action.payload;
        setKeySelected(state, key, selected);
      } else {
        assert(false, action.payload);
      }
    },

    setCurrent: (state, action) => {
      const key = action.payload;
      if (key) {
        setCurrent(state, key);
      } else {
        setCurrent(state, null);
      }
    },

    navRight: state => {
      nav(state, 1);
    },

    navLeft: state => {
      nav(state, -1);
    },

    extendRight: state => {
      extend(state, 1);
    },

    extendLeft: state => {
      extend(state, -1);
    },

    selectTo: (state, action) => {
      const key = action.payload;
      setAllSelected(state, selectToKeys(state, key));
      if (!state.current) {
        setCurrent(state, key);
      }
    },

    deselectAll: state => {
      setAllSelected(state, []);
      setCurrent(state, null);
    },

    deselect: (state, action) => {
      const keys = action.payload;
      removeSelected(state, keys);
    },

    selectAll: state => {
      setAllSelected(state, state.available);
      if (!state.current && state.available.length) {
        setCurrent(state, state.available[0]);
      }
    },

    selectCurrent: state => {
      if (state.current) {
        setAllSelected(state, [state.current]);
      }
    },

    setCompareMode: (state, action) => {
      const val: boolean = action.payload;
      setCompareMode(state, val);
    },

    setCompare: (state, action) => {
      const val = action.payload;
      setCompare(state, val);
    },

    applyImplicitCompare: state => {
      applyImplicitCompare(state);
    }
  }
});

export const reducer = slice.reducer;

function setAvailable(state: SelectionState, keys: string[]) {
  state.available = keys;
}

function setCurrent(state: SelectionState, key: string | null) {
  if (key !== state.current) {
    setExtendSide(state, null);
  }
  state.current = key;
}

function setExtendSide(state: SelectionState, side: ExtendSide) {
  state.extendSide = side;
}

function setAllSelected(state: SelectionState, keys: string[]) {
  state.selected = new Set(keys);
  setExtendSide(state, null);
}

function removeSelected(state: SelectionState, keys: string[]) {
  if (keys.length) {
    const toRemove = new Set(keys);
    setAllSelected(
      state,
      [...state.selected].filter(key => !toRemove.has(key))
    );
    if (state.current && toRemove.has(state.current)) {
      setCurrent(state, null);
    }
  }
}

function setKeySelected(state: SelectionState, key: string, selected: boolean) {
  if (selected) {
    state.selected.add(key);
  } else {
    state.selected.delete(key);
  }
  setExtendSide(state, null);
}

function selectToKeys(state: SelectionState, key: string) {
  const current = state.current;
  if (!current || key === current) {
    return [key];
  }
  let inRange = false;
  return state.available.filter(availKey => {
    const keyMatch = availKey === key || availKey === current;
    inRange = (inRange && !keyMatch) || (!inRange && keyMatch);
    return inRange || keyMatch;
  });
}

function nav(state: SelectionState, step: Step) {
  if (state.compareMode && state.selected.size > 2 && state.current) {
    navCompare(state, step);
  } else {
    navCurrent(state, step);
  }
}

function navCompare(state: SelectionState, step: Step) {
  const navPool = orderSelected(state.selected, state.available).filter(
    key => key !== state.current
  );
  const next = navNext(state.compare, navPool, step);
  if (next) {
    setCompare(state, next);
  }
}

function navCurrent(state: SelectionState, step: Step) {
  const navPool =
    state.selected.size > 1
      ? orderSelected(state.selected, state.available)
      : state.available;
  const next = navNext(state.current, navPool, step);
  if (next) {
    setCurrent(state, next);
    if (state.selected.size <= 1) {
      setAllSelected(state, [next]);
    }
  }
}

function orderSelected(selected: Set<string>, available: string[]): string[] {
  return available.filter(key => selected.has(key));
}

function navNext(
  current: string | null,
  pool: string[],
  step: Step
): string | null {
  if (!current) {
    return step === 1 ? pool[0] : pool[pool.length - 1];
  }
  if (pool.length <= 1) {
    return current;
  }
  const curIndex = pool.indexOf(current);
  if (curIndex === -1) {
    return pool.length ? pool[0] : null;
  }
  const nextIndex = curIndex + step;
  if (nextIndex < 0 || nextIndex >= pool.length) {
    return current;
  }
  return pool[nextIndex];
}

function extend(state: SelectionState, step: Step) {
  if (state.available.length === 0) {
    return;
  }
  const side = extendSideForStep(step, state);
  extendSelect(state, side, step);
  setExtendSide(state, state.selected.size > 1 ? side : null);
}

function extendSideForStep(step: Step, state: SelectionState): ExtendSide {
  if (state.extendSide) {
    return state.extendSide;
  }
  if (step === 1) {
    return 'right';
  } else {
    assert(step === -1, step);
    return 'left';
  }
}

function extendSelect(state: SelectionState, side: ExtendSide, step: Step) {
  const adding =
    (side === 'right' && step === 1) || (side === 'left' && step === -1);
  if (adding) {
    const key = nextAvailForExtend(state, side);
    if (key) {
      state.selected.add(key);
    }
  } else {
    // Removing
    const { key } = selectedEnd(state, side);
    if (key) {
      state.selected.delete(key);
    }
  }
}

function nextAvailForExtend(state: SelectionState, side: ExtendSide) {
  const { index } = selectedEnd(state, side);
  const next = side === 'right' ? index + 1 : index - 1;
  return next >= 0 && next < state.available.length
    ? state.available[next]
    : undefined;
}

function selectedEnd(state: SelectionState, side: ExtendSide) {
  if (side === 'right') {
    const index = state.available.findLastIndex(key => {
      return state.selected.has(key);
    });
    return { index, key: state.available[index] };
  } else {
    const index = state.available.findIndex(key => {
      return state.selected.has(key);
    });
    return { index, key: state.available[index] };
  }
}

function setCompareMode(state: SelectionState, val: boolean) {
  state.compareMode = val;
}

function setCompare(state: SelectionState, val: string | null) {
  state.compare = val;
}

function applyImplicitCompare(state: SelectionState) {
  if (state.selected.size < 1) {
    state.compare = null;
  } else {
    if (
      !state.compare ||
      state.compare === state.current ||
      !state.selected.has(state.compare)
    ) {
      state.compare = defaultCompare(state);
    }
  }
}

function defaultCompare(state: SelectionState) {
  return (
    state.available.find(
      key => state.selected.has(key) && key !== state.current
    ) || null
  );
}

export function useSetAvailable() {
  const dispatch = useDispatch();
  return (keys: string[]) => {
    dispatch(slice.actions.setAvailable(keys));
  };
}

export function useKeySelected(key: string): ReactState<boolean> {
  const dispatch = useDispatch();
  const selected = useSelector((state: State) =>
    state.selection.selected.has(key)
  );
  const setSelected = (selected: boolean) => {
    dispatch(slice.actions.setSelected([key, selected]));
  };
  return [selected, setSelected];
}

export function useKeySelectedClicked(
  key: string
): [boolean, boolean, (e?: any) => void] {
  const dispatch = useDispatch();

  const selected = useSelector((state: State) => state.selection.selected);
  const compareMode = useSelector(
    (state: State) => state.selection.compareMode
  );
  const current = useSelector((state: State) => state.selection.current);
  const compare = useSelector((state: State) => state.selection.compare);

  const defaultClicked = () => {
    if (!selected.has(key)) {
      dispatch(slice.actions.setSelected([key]));
    }
    if (key !== current) {
      dispatch(slice.actions.setCurrent(key));
    }
  };

  const shiftClicked = () => {
    dispatch(slice.actions.selectTo(key));
  };

  const defaultCtrlClicked = () => {
    dispatch(slice.actions.setSelected([key, !selected.has(key)]));
    if (key === current) {
      dispatch(slice.actions.setCurrent(null));
    }
  };

  const defaultClickedCompareMode = () => {
    // Compare mode enables special handling for default clicks, which lets the
    // user click a second run to select a compare or current run.
    if (current && key !== current && !compare) {
      // Current is selected - click selects compare
      dispatch(slice.actions.setSelected([key, current]));
      dispatch(slice.actions.setCompare(key));
    } else if (compare && key !== compare && !current) {
      // Compare is selected - click selects current
      dispatch(slice.actions.setSelected([key, compare]));
      dispatch(slice.actions.setCurrent(key));
    } else if (key === compare && current) {
      // Clicked compare - swap current and compare
      dispatch(slice.actions.setCompare(current));
      dispatch(slice.actions.setCurrent(compare));
    } else {
      defaultClicked();
    }
  };

  const ctrlClickedCompareMode = () => {
    // Compare mode changes ctrl+click to support specifying the compare run.
    if (key === compare) {
      // Ctrl+click compare run deselects it
      dispatch(slice.actions.setCompare(null));
      dispatch(slice.actions.setSelected([key, false]));
    } else if (key !== current && key !== compare && selected.has(key)) {
      // Ctrl+click on selected run that's not compare or current - select as
      // compare
      dispatch(slice.actions.setCompare(key));
    } else if (key === current && compare) {
      // Ctrl+click current when compare is selected - swap current and compare
      dispatch(slice.actions.setCompare(current));
      dispatch(slice.actions.setCurrent(compare));
    } else {
      defaultCtrlClicked();
    }
  };

  const clicked = (e?: any) => {
    if (e && e.shiftKey) {
      shiftClicked();
    } else if (e && e.ctrlKey) {
      if (compareMode) {
        ctrlClickedCompareMode();
      } else {
        defaultCtrlClicked();
      }
    } else {
      if (compareMode) {
        defaultClickedCompareMode();
      } else {
        defaultClicked();
      }
    }
  };

  return [selected.has(key), key === current, clicked];
}

export function useSelected() {
  return useSelector((state: State) => state.selection.selected);
}

export function useCurrent() {
  return useSelector((state: State) => state.selection.current);
}

export function useSetCurrent() {
  const dispatch = useDispatch();
  return (key: string) => {
    dispatch(slice.actions.setCurrent(key));
  };
}

export function useWantsToView(key: string) {
  const compareMode = useSelector(
    (state: State) => state.selection.compareMode
  );
  const current = useSelector((state: State) => state.selection.current);
  const compare = useSelector((state: State) => state.selection.compare);

  return compareMode ? key === compare || key === current : key === current;
}

export function useScrollIntoView(
  key: string,
  ref: React.RefObject<HTMLElement>
) {
  const wantsToView = useWantsToView(key);

  React.useEffect(() => {
    if (wantsToView && ref.current) {
      ensureVisible(ref.current);
    }
  }, [wantsToView, ref]);
}

export function useAppInit() {
  useKeyboardBindings();
  useImplicitCompare();
}

function useKeyboardBindings() {
  const dispatch = useDispatch();
  useKeyDownListener([
    [
      e =>
        isKey(e, { key: 'ArrowRight', shift: true }) ||
        isKey(e, { key: 'ArrowDown', shift: true }),
      () => dispatch(slice.actions.extendRight())
    ],
    [
      e => isKey(e, 'ArrowRight') || isKey(e, 'ArrowDown'),
      () => dispatch(slice.actions.navRight())
    ],
    [
      e =>
        isKey(e, { key: 'ArrowLeft', shift: true }) ||
        isKey(e, { key: 'ArrowUp', shift: true }),
      () => dispatch(slice.actions.extendLeft())
    ],
    [
      e => isKey(e, 'ArrowLeft') || isKey(e, 'ArrowUp'),
      () => dispatch(slice.actions.navLeft())
    ],
    [
      e => isKey(e, { key: 'D', shift: true, ctrl: true }),
      () => dispatch(slice.actions.selectCurrent())
    ],
    [
      e => isKey(e, { key: 'd', ctrl: true }),
      () => dispatch(slice.actions.deselectAll())
    ],
    [
      e => isKey(e, { key: 'a', ctrl: true }),
      () => dispatch(slice.actions.selectAll())
    ]
  ]);
}

function useImplicitCompare() {
  const dispatch = useDispatch();
  const selected = useSelector((state: State) => state.selection.selected);
  const current = useSelector((state: State) => state.selection.current);

  React.useEffect(() => {
    dispatch(slice.actions.applyImplicitCompare());
  }, [dispatch, selected, current]);
}

export function useDeselect() {
  const dispatch = useDispatch();
  return (keys: string[]) => {
    dispatch(slice.actions.deselect(keys));
  };
}

type SelectionActionState = {
  canSelect: boolean;
  canDeselect: boolean;
  canSelectOnlyCurrent: boolean;
  extendOrShrinkRight: 'extend' | 'shrink';
  canExtendRight: boolean;
  extendOrShrinkLeft: 'extend' | 'shrink';
  canExtendLeft: boolean;
  canChangeCurrentRight: boolean;
  canChangeCurrentLeft: boolean;
};

export function useSelectionActionState(): SelectionActionState {
  const selection = useSelector((state: State) => state.selection);
  const available = selection.available;
  const selected = selection.selected;
  const current = selection.current;
  const extendSide = selection.extendSide;

  const extendOrShrinkRight =
    !extendSide || extendSide === 'right' ? 'extend' : 'shrink';

  const extendOrShrinkLeft =
    !extendSide || extendSide === 'left' ? 'extend' : 'shrink';

  const firstAvailable = available[0];
  const lastAvailable = available[available.length - 1];

  return {
    canSelect: available.length > 0,
    canDeselect: selected.size > 0,
    canSelectOnlyCurrent: current !== null && selected.size > 1,
    extendOrShrinkRight,
    canExtendRight:
      selected.size > 0 &&
      (extendOrShrinkRight === 'shrink' || !selected.has(lastAvailable)),
    extendOrShrinkLeft,
    canExtendLeft:
      selected.size > 0 &&
      (extendOrShrinkLeft === 'shrink' || !selected.has(firstAvailable)),
    canChangeCurrentRight: available.length > 0 && lastAvailable !== current,
    canChangeCurrentLeft: available.length > 0 && firstAvailable !== current
  };
}

export function useCompare(): [boolean, string | null, string | null] {
  const compareMode = useSelector(
    (state: State) => state.selection.compareMode
  );
  const compare = useSelector((state: State) => state.selection.compare);
  const current = useSelector((state: State) => state.selection.current);

  return [compareMode, compare, current];
}

export function useSetCompareMode() {
  const dispatch = useDispatch();
  return (val: boolean) => {
    dispatch(slice.actions.setCompareMode(val));
  };
}
