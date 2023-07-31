import React from 'react';

import { Stack } from '@mui/joy';

import * as d3 from 'd3';

import {
  useHighlight,
  useHighlightBrush,
  useHighlightBrushReset,
  useHighlightBrushSelection,
  useHover,
  useIntersectHighlighted
} from '../highlight';
import { useCurrent, useSetCurrent } from '../selection';
import { TickFormat, numericTickFormat, seriesColorForRun, useSummariesCompare } from '../summaries';

import { cmpNat, isNumber, useRect } from '../utils';

import { RunsCompare, RunCompareData, RunScalars } from '../types';

type Col = {
  name: string;
  min?: number;
  max?: number;
  unique?: Set<string>;
  vals: any[];
};

function initCol(name: string): Col {
  return { name, vals: [] };
}

function applyColVal(col: Col, val: any, index: number) {
  if (isNumber(val)) {
    col.min = col.min === undefined ? val : Math.min(col.min, val);
    col.max = col.max === undefined ? val : Math.max(col.max, val);
  } else {
    col.unique ??= new Set();
    col.unique.add(val);
  }
  col.vals[index] = val;
}

type RunData = {
  runId: string;
  flags: { [name: string]: any };
  attributes: { [name: string]: any };
  scalars: { [name: string]: any };
};

type RunsData = RunData[];

function chartCols(compare: RunsCompare | undefined): [string[], Col[]] {
  const data = runsDataForCompare(compare || {});
  const cols: Col[] = [];

  applyFlagCols(data, cols);
  applyAttributeCols(data, cols);
  applyScalarCols(data, cols);

  return [data.map(runData => runData.runId), cols];
}

function runsDataForCompare(compare: RunsCompare): RunsData {
  return Object.keys(compare)
    .sort()
    .map(runId => runDataForCompare(runId, compare[runId]));
}

function runDataForCompare(
  runId: string,
  { flags, attributes, scalars }: RunCompareData
): RunData {
  return {
    runId,
    flags,
    attributes,
    scalars: mapScalarLastVals(scalars)
  };
}

function mapScalarLastVals(scalars: RunScalars): {
  [tag: string]: number | undefined;
} {
  return Object.fromEntries(
    Object.keys(scalars).map(name => [name, scalars[name].lastVal])
  );
}

function applyFlagCols(data: RunsData, cols: Col[]) {
  const [apply, applied] = genApplyColVals();

  data.forEach(({ flags }: RunData, i) => {
    Object.keys(flags).forEach(name => {
      apply(name, flags[name], i);
    });
  });

  cols.push(...applied());
}

function genApplyColVals(): [
  (arg0: string, arg1: any, arg2: number) => void,
  () => Col[]
] {
  const cols: { [name: string]: Col } = {};

  const apply = (name: string, val: any, index: number) => {
    const col = (cols[name] ??= initCol(name));
    applyColVal(col, val, index);
  };

  const applied = (): Col[] => {
    return Object.keys(cols)
      .sort(cmpNat)
      .map(name => cols[name]);
  };

  return [apply, applied];
}

function applyAttributeCols(data: RunsData, cols: Col[]) {
  const [apply, applied] = genApplyColVals();

  data.forEach(({ attributes }: RunData, i) => {
    Object.keys(attributes).forEach(name => {
      apply(name, attributes[name], i);
    });
  });

  cols.push(...applied());
}

function applyScalarCols(data: RunsData, cols: Col[]) {
  const [apply, applied] = genApplyColVals();

  data.forEach(({ scalars }: RunData, i) => {
    Object.keys(scalars).forEach(name => {
      apply(name, scalars[name], i);
    });
  });

  cols.push(...applied());
}

type YScale = d3.ScaleLinear<number, number> | d3.ScalePoint<any>;

function initYScale(col: Col, height: number): YScale {
  return col.unique
    ? d3.scalePoint().domain(discreteDomain(col)).range([height, 0])
    : d3.scaleLinear().domain(continuousDomain(col)).range([height, 0]).nice();
}

function discreteDomain(col: Col): string[] {
  return [...col.unique!].sort(cmpNat);
}

function continuousDomain(col: Col): [number, number] {
  if (col.min === undefined || col.max === undefined) {
    return [-1, 1];
  }
  return [col.min - col.min * 0.1, col.max + col.max * 0.1];
}

type XScale = d3.ScalePoint<string>;

function initXScale(cols: Col[], width: number): XScale {
  return d3
    .scalePoint()
    .domain(cols.map(col => col.name))
    .range([0, width])
    .padding(0.5);
}

type RunSeriesProps = {
  runId: string;
  runIndex: number;
  cols: Col[];
  yScales: YScale[];
  xScale: XScale;
};

function RunSeries({ runId, runIndex, cols, yScales, xScale }: RunSeriesProps) {
  const [hover, setHover] = useHover();
  const current = useCurrent();
  const setCurrent = useSetCurrent();
  const highlighted = useIntersectHighlighted();

  const thisCurrent = current === runId;
  const thisHover = hover === runId;
  const thisHighlight = highlighted && highlighted.has(runId);
  const highlighting = highlighted !== null;

  const line = seriesLine(runIndex, cols, yScales, xScale);
  const color = seriesColorForRun(runId);

  const opacity = highlighting
    ? thisHighlight
      ? 1.0
      : thisHover || (thisCurrent && !hover)
      ? 0.2
      : 0.1
    : thisHover || (thisCurrent && !hover)
    ? 1.0
    : 0.6;

  return line ? (
    <g>
      <path
        d={line}
        opacity={opacity}
        strokeWidth={thisHover ? 2.5 : 1.5}
        stroke={color}
        fill="none"
      />
      <path
        d={line}
        opacity={0}
        strokeWidth={8}
        stroke="black" // required - any color will do
        fill="none"
        onClick={() => setCurrent(runId)}
        onMouseEnter={() => setHover(runId)}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'pointer' }}
      />
    </g>
  ) : (
    <g></g>
  );
}

function seriesLine(
  runIndex: number,
  cols: Col[],
  yScales: YScale[],
  xScale: XScale
) {
  return d3.line()(
    cols.map((col, colIndex): [number, number] => [
      xScale(col.name) || 0,
      yScales[colIndex](col.vals[runIndex]) || 0
    ])
  );
}

function colTickFormat(col: Col): TickFormat | null {
  return col.min !== undefined && col.max !== undefined
    ? numericTickFormat(col.vals)
    : discreteColTickFormat();
}

function discreteColTickFormat(): TickFormat {
  const maxWidth = 10;
  return (x: any): string => {
    const s = String(x);
    return s.length <= maxWidth ? s : `${s.slice(0, maxWidth - 2)}...`;
  };
}

function useColBrush(col: Col, yScale: YScale, highlight: ColHighlight) {
  const saveBrush = useHighlightBrush(col.name);

  const brushWidth = 16;

  const brushed = (e: d3.D3BrushEvent<any>) => {
    if (e.sourceEvent.type === 'brushInit') {
      // Avoid recursion from brush init (see `brush.move` below)
      return;
    }
    const selection = e.selection as [number, number] | null;
    highlight(col.name, brushedVals(selection, col, yScale));
    if (e.type === 'end') {
      // Save brush selection for column only on end event - otherwise
      // generates pointless load on redux store
      saveBrush(selection);
    }
  };

  return d3
    .brushY()
    .extent([
      [-(brushWidth / 2), yScale.range()[1]],
      [brushWidth / 2, yScale.range()[0]]
    ])
    .on('brush end', brushed);
}

function brushedVals(
  selection: [number, number] | null,
  col: Col,
  scale: YScale
): number[] | null {
  if (!selection) {
    return null;
  }
  if ((scale as any).invert) {
    return continuousBrushedVals(
      selection,
      col,
      scale as d3.ScaleContinuousNumeric<number, number>
    );
  } else {
    return discreteBrushedVals(selection, col, scale as d3.ScalePoint<any>);
  }
}

function continuousBrushedVals(
  [y0, y1]: [number, number],
  col: Col,
  scale: d3.ScaleContinuousNumeric<number, number>
): number[] {
  const [min, max] = [scale.invert(y1), scale.invert(y0)];
  return col.vals.flatMap((val, i) => (val >= min && val <= max ? [i] : []));
}

function discreteBrushedVals(
  [y0, y1]: [number, number],
  col: Col,
  scale: d3.ScalePoint<any>
): number[] {
  const range = scale.range();
  const domain = scale.domain();
  const points =
    domain.length > 1
      ? [...d3.range(range[0], range[1], -scale.step()), range[1]]
      : [(range[0] - range[1]) / 2];
  const inPoints = (val: any) => {
    const domainPos = domain.indexOf(val);
    const yVal = points[domainPos];
    return yVal >= y0 && yVal <= y1;
  };
  return col.vals.flatMap((val, i) => (inPoints(val) ? [i] : []));
}

function useColAxis(
  col: Col,
  yScale: YScale,
  axisRef: React.RefObject<SVGGElement>,
  highlight: ColHighlight
) {
  const brush = useColBrush(col, yScale, highlight);
  const brushSelection = useHighlightBrushSelection(col.name);

  React.useEffect(() => {
    if (!axisRef.current) {
      return;
    }
    const root = d3.select(axisRef.current);
    root.selectAll('*').remove();
    root
      .append('g')
      .call(
        d3
          .axisLeft(yScale as d3.AxisScale<d3.NumberValue>)
          .tickFormat(colTickFormat(col)!)
      )
      .call(brush)
      // Restore saved brush for column - use custom event to differentiate init
      // from user events
      .call(brush.move, brushSelection, new Event('brushInit'));

    // Sync highlighted with saved brush
    highlight(col.name, brushedVals(brushSelection, col, yScale));
  }, [axisRef, col, yScale, brush, brushSelection, highlight]);
}

type ColAxisProps = {
  col: Col;
  xScale: XScale;
  yScale: YScale;
  highlight: ColHighlight;
};

function ColAxis({ col, xScale, yScale, highlight }: ColAxisProps) {
  const axisRef = React.useRef(null);

  useColAxis(col, yScale, axisRef, highlight);

  return (
    <g transform={`translate(${xScale(col.name)})`}>
      <g ref={axisRef} />
      <text
        fill="var(--joy-palette-text-tertiary)"
        textAnchor="middle"
        fontSize="var(--joy-fontSize-xs)"
        y="-0.9rem"
      >
        {col.name}
      </text>
    </g>
  );
}

export type ColHighlight = (arg0: string, arg1: number[] | null) => void;

function useColHighlight(runs: string[]): ColHighlight {
  const highlight = useHighlight();
  return (colName: string, selected: number[] | null) => {
    highlight(colName, selected ? selected.map(i => runs[i]) : null);
  };
}

function useBrushReset(cols: Col[]) {
  const reset = useHighlightBrushReset();
  reset(cols.map(col => col.name));
}

export default function ParallelCoordinates() {
  const rootRef = React.useRef(null);

  const compare = useSummariesCompare();

  const [runs, cols] = chartCols(compare);

  useBrushReset(cols);

  const highlight = useColHighlight(runs);

  const size = useRect(rootRef);

  const width = size ? size.width : 240;
  const height = 320;
  const margin = { top: 24, right: 0, bottom: 10, left: 0 };
  const boundsWidth = width - margin.right - margin.left;
  const boundsHeight = height - margin.top - margin.bottom;

  const yScales = cols.map(col => initYScale(col, boundsHeight));
  const xScale = initXScale(cols, boundsWidth);

  return (
    <Stack ref={rootRef}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[margin.left, margin.top].join(',')})`}
        >
          {runs.map((runId, i) => (
            <RunSeries
              key={runId}
              runId={runId}
              runIndex={i}
              cols={cols}
              yScales={yScales}
              xScale={xScale}
            />
          ))}
          {cols.map((col, i) => (
            <ColAxis
              key={`col-${i}`}
              col={col}
              xScale={xScale}
              yScale={yScales[i]}
              highlight={highlight}
            />
          ))}
        </g>
      </svg>
    </Stack>
  );
}
