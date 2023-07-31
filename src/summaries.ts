import * as d3 from 'd3';

import { useFilteredRuns, useSelectedRuns } from './runs';
import { runsCompareApi, runsScalarsApi } from './api';

import { crc16 } from './crc';
import { brightenColor, darkenColor } from './utils';

import { Run, RunsCompare, RunsScalars } from './types';

import { darkMode } from './prefs';

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

export function seriesColorForRun(runId: string): string {
  // Ref: https://github.com/d3/d3-scale-chromatic

  const runIdHash = crc16(runId);
  const colorFactor = runIdHash / 2 ** 16;
  return (darkMode ? brightenColor : darkenColor)(
    d3.interpolateSinebow(colorFactor)
  );
}

export type TickFormat = (arg0: any) => string;

export function numericTickFormat(vals: number[]): TickFormat | null {
  return singleDecimalVal(vals)
    ? (n: any) => d3.format('.4f')(n)
    : veryLargeVals(vals)
    ? (n: any) => d3.format('.2s')(n)
    : verySmallVals(vals)
    ? (n: any) => d3.format('.2e')(n)
    : null;
}

function singleDecimalVal(vals: number[]) {
  return vals.length === 1 && Math.floor(vals[0]) !== vals[0];
}

function veryLargeVals(vals: number[]) {
  return vals.some(x => Math.abs(x) > 1e6);
}

function verySmallVals(vals: number[]) {
  return vals.some(x => Math.abs(x) < 1e-3);
}

export function paddedExtent(vals: number[], pad?: number) {
  const [min, max] = d3.extent(vals);
  if (min === undefined || max === undefined) {
    return [0,0];
  }
  const range = max - min;
  pad = pad || 0.05;
  return [min - (pad * range), max + (pad * range)];
}
