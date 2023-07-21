import React from 'react';

import { useColorScheme } from '@mui/joy';

import numeral from 'numeral';

import { RunCompareData, RunScalar, RunsCompare } from './types';

export function formatRunDate(epochMs: number | null) {
  if (!epochMs) {
    return '';
  }
  const d = new Date(epochMs / 1000);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function formatFileDate(epochSec: number | null) {
  if (!epochSec) {
    return '';
  }
  const d = new Date(epochSec);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function assert(condition: any, info?: any): void {
  if (!condition) {
    if (info !== undefined) {
      console.error('assertion info', info);
    }
    throw new Error('assertion failed');
  }
}

export function assertFailed(info?: any): never {
  if (info !== undefined) {
    console.error(info);
  }
  throw new Error('assertion failed');
}

export function ensureVisible(e: HTMLElement) {
  if (needsScroll(e)) {
    e.scrollIntoView();
  }
}

function needsScroll(e: HTMLElement): boolean {
  const viewport = elementViewport(e);
  if (!viewport) {
    return false;
  }
  const eBounds = e.getBoundingClientRect();
  const vBounds = viewport.getBoundingClientRect();
  switch (e.role) {
    case 'row':
      return rowNeedsScroll(eBounds, vBounds);
    default:
      return blockNeedsScroll(eBounds, vBounds);
  }
}

function rowNeedsScroll(eBounds: DOMRect, vBounds: DOMRect) {
  return eBounds.top < vBounds.top || eBounds.bottom > vBounds.bottom;
}

function blockNeedsScroll(eBounds: DOMRect, vBounds: DOMRect) {
  return (
    eBounds.top < vBounds.top ||
    eBounds.bottom > vBounds.bottom ||
    eBounds.left < vBounds.left ||
    eBounds.right > vBounds.right
  );
}

function elementViewport(e: HTMLElement): HTMLElement | null {
  const parent = e.parentElement;
  if (!parent) {
    return null;
  }
  const style = getComputedStyle(parent);
  if (style.overflowX === 'auto' || style.overflowY === 'auto') {
    return parent;
  }
  return elementViewport(parent);
}

export function runDurationSeconds(
  started: number | null,
  stopped: number | null
): number | null {
  if (!started) {
    return null;
  }
  if (!stopped) {
    stopped = Date.now() * 1000;
  }
  return Math.floor((stopped - started) / 1000000);
}

export function formatRunDuration(
  started: number | null,
  stopped: number | null
) {
  const seconds = runDurationSeconds(started, stopped);
  if (seconds === null) {
    return '';
  }
  const divmod = (x: number, y: number) => [Math.floor(x / y), x % y];
  const [m0, s] = divmod(seconds, 60);
  const [h, m] = divmod(m0, 60);
  return `${h}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

export function useKeyDownListener(
  mapping: [(e: KeyboardEvent) => boolean, () => void][]
) {
  React.useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      for (const [test, handle] of mapping) {
        if (test(e)) {
          e.preventDefault();
          handle();
          break;
        }
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [mapping]);
}

type Key = { key: string; ctrl?: boolean; alt?: boolean; shift?: boolean };

export function isKey(e: KeyboardEvent, arg1: Key | string): boolean {
  const { key, ctrl, alt, shift }: Key =
    typeof arg1 === 'object' ? arg1 : { key: arg1 };
  return (
    e.key === key &&
    e.ctrlKey === (ctrl || false) &&
    e.altKey === (alt || false) &&
    e.shiftKey === (shift || false)
  );
}

export function useRefreshListener(handler: () => void) {
  useKeyDownListener([[e => isKey(e, { key: 'R', shift: true }), handler]]);
}

export function useRefreshTrigger(): number {
  const [trigger, setTrigger] = React.useState(0);
  useRefreshListener(() => setTrigger(trigger + 1));
  return trigger;
}

export function dispatchKeyDownEvent(
  key: string,
  opts?: { shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean }
) {
  const event = new KeyboardEvent('keydown', { key: key, ...opts });
  window.dispatchEvent(event);
}

export function useEscToClearFocus() {
  const clearFocus = () => {
    if (
      document.activeElement &&
      (document.activeElement as HTMLElement).blur
    ) {
      (document.activeElement as HTMLElement).blur();
    }
  };
  useKeyDownListener([[e => isKey(e, { key: 'Escape' }), clearFocus]]);
}

export function disableShiftSelect(e: React.MouseEvent) {
  if (e.shiftKey) {
    e.preventDefault();
  }
}

export function formatScalar(val: number): string {
  const fmt =
    val >= 1000
      ? '0,000'
      : val >= 100
      ? '0,000.00'
      : val > 1e-6 || val < -1e-6
      ? '0.0000'
      : '0.0000e+0';
  return numeral(val).format(fmt);
}

export function formatScalarLastVal(s: RunScalar): string {
  const val = formatScalar(s.lastVal);
  return s.lastStep === 0 ? val : `${val} (step ${s.lastStep})`;
}

export function formatInt(val: number): string {
  return numeral(val).format('0,000');
}

export function isNumber(val: any): boolean {
  return Number(val) === val;
}

export function isInt(val: any): boolean {
  return Number(val) === val && val % 1 === 0;
}

export function isFloat(val: any): boolean {
  return Number(val) === val && val % 1 !== 0;
}

export function isString(val: any): boolean {
  return typeof val === 'string' || val instanceof String;
}

export function ensureLower(val: any): any {
  return isString(val) ? (val as string).toLowerCase() : val;
}

export function isTextType(type: string | null): boolean {
  return type ? type.startsWith('text/') || type === 'application/json' : false;
}

export function isImageType(type: string | null): boolean {
  return type ? type.startsWith('image/') : false;
}

export function isRunId(val: any): boolean {
  return isString(val) && /^[a-f0-9]{32}$/.test(val as string);
}

export function formatFlagValue(val: any) {
  if (val == null) {
    return '';
  } else if (isInt(val)) {
    return formatInt(val);
  } else if (isFloat(val)) {
    return formatScalar(val);
  } else {
    return String(val);
  }
}

export function useDarkTheme(): boolean {
  const { mode, systemMode } = useColorScheme();
  return mode === 'dark' || (mode === 'system' && systemMode === 'dark');
}

export function runsCompareFlagNames(compare: RunsCompare): string[] {
  return runsCompareNames(compare, data => data.flags);
}

export function runsCompareScalarNames(compare: RunsCompare): string[] {
  return runsCompareNames(compare, data => data.scalars);
}

function runsCompareNames(
  compare: RunsCompare,
  attr: (arg0: RunCompareData) => { [key: string]: any }
): string[] {
  const all = Object.keys(compare).reduce<string[]>(
    (acc, runId) => acc.concat(Object.keys(attr(compare[runId]))),
    []
  );
  return [...new Set(all)];
}

export function removeDuplicates(a: any[]) {
  const seen = new Set();
  return a.filter(x => {
    if (!seen.has(x)) {
      seen.add(x);
      return true;
    }
    return false;
  });
}

export function useDimensions(ref: React.RefObject<HTMLElement>): {
  width: number;
  height: number;
} {
  const getDimensions = React.useCallback(() => {
    return {
      width: ref.current ? ref.current.offsetWidth : 0,
      height: ref.current ? ref.current.offsetHeight : 0
    };
  }, [ref]);

  const [dimensions, setDimensions] = React.useState(getDimensions);

  const handleResize = React.useCallback(() => {
    setDimensions(getDimensions());
  }, [getDimensions]);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  React.useLayoutEffect(() => {
    handleResize();
  }, [handleResize]);

  return dimensions;
}

export type ToggleState<T> = [
  (arg0: T) => boolean,
  (arg0: T) => void,
  (arg0: T[]) => void
];

export function useToggleState<T>(initial?: T[]): ToggleState<T> {
  const [state, setState] = React.useState<Set<T>>(new Set(initial || []));

  const test = (val: T) => {
    return state.has(val);
  };

  const toggle = (val: T) => {
    if (state.has(val)) {
      setState(new Set([...state].filter(t => t !== val)));
    } else {
      setState(new Set([...state, val]));
    }
  };

  const set = (vals: T[]) => {
    setState(new Set(vals));
  };

  return [test, toggle, set];
}

export function cmp(a: any, b: any, desc?: boolean): number {
  /* eslint-disable eqeqeq */
  return a == undefined
    ? b == undefined
      ? 0
      : 1
    : b == undefined
    ? -1
    : (a > b ? 1 : a < b ? -1 : 0) * (desc ? -1 : 1);
}

export function cmpNat(a: string, b: string) {
  return a.localeCompare(b, undefined, {numeric: true});
}

export function range(n: number): number[] {
  return Object.keys([...Array(n)]).map(key => Number(key));
}
