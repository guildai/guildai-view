import React from 'react';

import { Box, Grid, Stack } from '@mui/joy';

import * as d3 from 'd3';

import Panel from '../components/Panel';

import {
  seriesColorForRun,
  useSummariesCompare,
  numericTickFormat,
  paddedExtent
} from '../summaries';

import { cmpNat, isNumber, items, useRect, values } from '../utils';

import { RunCompareData, RunsCompare } from '../types';

type YReader = (arg0: RunCompareData) => any;

type PlotVal = [string, number, number];

type XScale = d3.ScaleLinear<number, number>;

type XAxisProps = {
  scale: XScale;
  height: number;
  vals: PlotVal[];
};

function XAxis({ scale, height, vals }: XAxisProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = d3.select(ref.current);
    root.selectAll('*').remove();
    root
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(scale)
          .ticks(5)
          .tickFormat(numericTickFormat(vals.map(d => d[1]))!)
      );
  }, [ref, scale, height, vals]);

  return <g ref={ref} />;
}

type YScale = d3.AxisScale<d3.NumberValue>;

type YAxisProps = {
  scale: YScale;
  vals: PlotVal[];
};

function YAxis({ scale, vals }: YAxisProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = d3.select(ref.current);
    root.selectAll('*').remove();
    root.append('g').call(
      d3
        .axisLeft(scale)
        .ticks(5)
        .tickFormat(numericTickFormat(vals.map(d => d[2]))!)
    );
  }, [ref, scale, vals]);

  return <g ref={ref}></g>;
}

type PlotPointProps = {
  val: PlotVal;
  xScale: XScale;
  yScale: YScale;
};

function PlotPoint({ val, xScale, yScale }: PlotPointProps) {
  const [runId, x, y] = val;
  return (
    <circle
      cx={xScale(x)}
      cy={yScale(y)}
      r={3}
      fill={seriesColorForRun(runId)}
      opacity={0.5}
    />
  );
}

function scatterPlotVals(
  compare: RunsCompare,
  yReader: YReader,
  scalar: string
): PlotVal[] {
  return items(compare)
    .map(
      ([runId, data]: [string, RunCompareData]) =>
        [runId, data.scalars[scalar]?.lastVal, yReader(data)] as [
          string,
          any,
          any
        ]
    )
    .filter(
      ([runId, scalarVal, yVal]) => isNumber(yVal) && isNumber(scalarVal)
    );
}

function initXScale(vals: PlotVal[], width: number) {
  const [min, max] = paddedExtent(vals.map(d => d[1]));
  return d3.scaleLinear().domain([min, max]).range([0, width]).nice();
}

function initYScale(vals: PlotVal[], height: number) {
  const [min, max] = paddedExtent(vals.map(d => d[2]));
  return d3.scaleLinear().domain([min!, max!]).range([height, 0]).nice();
}

type ScalarScatterPlotProps = {
  scalar: string;
  yReader: YReader;
  compare: RunsCompare;
};

function ScalarScatterPlot({
  scalar,
  yReader,
  compare
}: ScalarScatterPlotProps) {
  const vals = scatterPlotVals(compare, yReader, scalar);

  const rootRef = React.useRef(null);

  const dim = useRect(rootRef);

  const width = dim?.width || 240;
  const height = 240;

  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const boundsWidth = width - margin.right - margin.left;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = initXScale(vals, boundsWidth);
  const yScale = initYScale(vals, boundsHeight);

  return (
    <Box ref={rootRef}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[margin.left, margin.top].join(',')})`}
        >
          <XAxis scale={xScale} height={boundsHeight} vals={vals} />
          <text
            fill="var(--joy-palette-text-secondary)"
            textAnchor="end"
            fontSize="var(--joy-fontSize-xs)"
            x={width / 2}
            y={height - margin.top}
          >
            {scalar}
          </text>
          <YAxis scale={yScale} vals={vals} />
          {vals.map(val => (
            <PlotPoint val={val} xScale={xScale} yScale={yScale} />
          ))}
        </g>
      </svg>
    </Box>
  );
}

type ScatterPlotRowProps = {
  title: string;
  compare: RunsCompare;
  yReader: YReader;
  scalars: string[];
};

function ScatterPlotRow({
  title,
  compare,
  yReader,
  scalars
}: ScatterPlotRowProps) {
  return (
    <Panel title={title}>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {scalars.map(s => (
          <Grid key={s} sm={4}>
            <ScalarScatterPlot scalar={s} yReader={yReader} compare={compare} />
          </Grid>
        ))}
      </Grid>
    </Panel>
  );
}

function accCompareNames(
  acc: [Set<string>, Set<string>, Set<string>],
  data: RunCompareData
) {
  const [flags, attributes, scalars] = acc;
  Object.keys(data.flags).forEach(key => flags.add(key));
  Object.keys(data.attributes).forEach(key => attributes.add(key));
  Object.keys(data.scalars).forEach(key => scalars.add(key));
  return acc;
}

function numericCompareRows(
  compare: RunsCompare
): [string[], string[], string[]] {
  const runsData = values(compare);
  const [flags, attributes, scalars] = runsData.reduce(accCompareNames, [
    new Set<string>(),
    new Set<string>(),
    new Set<string>()
  ]);

  const numericFlag = (name: string) =>
    runsData.some(data => isNumber(data.flags[name]));

  const numericAttribute = (name: string) =>
    runsData.some(data => isNumber(data.attributes[name]));

  return [
    [...flags].filter(numericFlag).sort(cmpNat),
    [...attributes].filter(numericAttribute).sort(cmpNat),
    [...scalars].sort(cmpNat)
  ];
}

export default function ScatterPlot() {
  const compare = useSummariesCompare() || {};

  const [flags, attributes, scalars] = numericCompareRows(compare);

  return (
    <Stack>
      {flags.map(name => (
        <ScatterPlotRow
          key={name}
          title={name}
          compare={compare}
          yReader={data => data.flags[name]}
          scalars={scalars}
        />
      ))}
      {attributes.map(name => (
        <ScatterPlotRow
          key={name}
          title={name}
          compare={compare}
          yReader={data => data.attributes[name]}
          scalars={scalars}
        />
      ))}
      {scalars.map(name => (
        <ScatterPlotRow
          key={name}
          title={name}
          compare={compare}
          yReader={data => data.scalars[name]?.lastVal}
          scalars={scalars}
        />
      ))}
    </Stack>
  );
}
