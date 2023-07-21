import React from 'react';

import * as d3 from 'd3';

import { useCurrent, useSetCurrent } from '../selection';
import { useHover } from '../highlight';
import { useSummariesScalars } from '../summaries';

import { useDimensions } from '../utils';
import { Box } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

type RunScalarsData = {
  runId: string;
  x: number[];
  y: number[];
};

function useScalarData(scalar: string): RunScalarsData[] {
  const [scalarsData] = useSummariesScalars();

  if (!scalarsData) {
    return [];
  }

  const scalarName = (path: string, tag: string) =>
    path === '.guild' ? tag : `${path}/${tag}`;

  return Object.keys(scalarsData).map(runId => {
    const x: number[] = [];
    const y: number[] = [];
    const runData = scalarsData[runId];
    Object.keys(runData).forEach(path => {
      runData[path].forEach(([tag, value, step]) => {
        if (scalarName(path, tag) === scalar) {
          x.push(step);
          y.push(value);
        }
      });
    });

    return {
      x,
      y,
      runId
    };
  });
}

function useScalarAxisScale(
  data: RunScalarsData[],
  dataVals: (d: RunScalarsData) => number[],
  range: [number, number],
  logScale?: boolean
) {
  const [min, max] = d3.extent(Array.prototype.concat(...data.map(dataVals)));
  return React.useMemo(() => {
    return (logScale ? d3.scaleLog() : d3.scaleLinear())
      .domain([min || 0, max || 0])
      .range(range);
  }, [logScale, range, min, max]);
}

function useScalarPlotAxes(
  data: RunScalarsData[],
  width: number,
  height: number,
  axesRef: React.RefObject<HTMLElement>,
  logScale?: boolean
) {
  const xScale = useScalarAxisScale(data, d => d.x, [0, width], logScale);
  const yScale = useScalarAxisScale(data, d => d.y, [height, 0], logScale);

  React.useEffect(() => {
    const svg = d3.select(axesRef.current);
    svg.selectAll('*').remove();
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));
    svg.append('g').call(d3.axisLeft(yScale));
  }, [axesRef, xScale, yScale, height]);

  return [xScale, yScale];
}

type ScalarSeriesProps = {
  data: RunScalarsData;
  xScale: (arg0: number) => number;
  yScale: (arg0: number) => number;
};

function ScalarSeries({ data, xScale, yScale }: ScalarSeriesProps) {
  const [hover, setHover] = useHover();
  const current = useCurrent();
  const setCurrent = useSetCurrent();

  const xyData: [number, number][] = data.x.map((xVal, i) => [xVal, data.y[i]]);

  const lineGen = d3
    .line<[number, number]>()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  const linePath = lineGen(xyData);

  return linePath ? (
    <g>
      <path
        d={linePath}
        opacity={hover === data.runId ? 1 : 0.7}
        strokeWidth={current === data.runId ? 2 : 1}
        stroke="yellow"
        fill="none"
      />
      <path
        d={linePath}
        opacity={0}
        strokeWidth={8}
        stroke="black" // required - any color will do
        fill="none"
        onClick={() => setCurrent(data.runId)}
        onMouseEnter={() => setHover(data.runId)}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: 'pointer' }}
      />
    </g>
  ) : (
    <g />
  );
}

type ScalarPlotProps = {
  scalar: string;
  logScale?: boolean;
  sx?: SxProps;
};

export default function ScalarPlot({ scalar, logScale, sx }: ScalarPlotProps) {
  const data = useScalarData(scalar);

  const rootRef = React.useRef(null);
  const axesRef = React.useRef(null);

  const dim = useDimensions(rootRef);

  const width = dim.width;
  const height = 240;

  const margin = { top: 20, right: 20, bottom: 20, left: 50 };

  const boundsWidth = width - margin.right - margin.left;
  const boundsHeight = height - margin.top - margin.bottom;

  const [xScale, yScale] = useScalarPlotAxes(
    data,
    boundsWidth,
    boundsHeight,
    axesRef,
    logScale
  );

  return (
    <Box ref={rootRef} sx={sx}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[margin.left, margin.top].join(',')})`}
        >
          {data.map(runData => (
            <ScalarSeries
              key={runData.runId}
              data={runData}
              xScale={xScale}
              yScale={yScale}
            />
          ))}
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[margin.left, margin.top].join(',')})`}
        />
      </svg>
    </Box>
  );
}
