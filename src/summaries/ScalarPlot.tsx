import React from 'react';

import { Box, Link, Table, Tooltip, TooltipProps } from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import * as d3 from 'd3';

import { useCurrent, useSetCurrent } from '../selection';
import { useHover, useScrollHoverIntoView } from '../highlight';
import { seriesColorForRun, useSummariesScalars } from '../summaries';

import { SX_VSCROLL_THIN } from '../styles';

import { cmp, flatten, formatScalar, useRect } from '../utils';

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

function initYScale(
  data: RunScalarsData[],
  height: number,
  logScale: boolean | undefined
) {
  const [min, max] = d3.extent(flatten(data.map(d => d.y)));
  return (logScale ? d3.scaleLog() : d3.scaleLinear())
    .domain([min || 0, max || 0])
    .range([height, 0])
    .nice();
}

function initXScale(data: RunScalarsData[], width: number) {
  const [min, max] = d3.extent(flatten(data.map(d => d.x)));
  return d3
    .scaleLinear()
    .domain([min || 0, max || 0])
    .range([0, width])
    .nice();
}

type XAxisProps = {
  scale: d3.ScaleLinear<number, number>;
  height: number;
};

function XAxis({ scale, height }: XAxisProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = d3.select(ref.current);
    root.selectAll('*').remove();
    root
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(scale));
  }, [ref, scale, height]);

  return <g ref={ref} />;
}

type YAxisProps = {
  scale: d3.AxisScale<d3.NumberValue>;
};

function YAxis({ scale }: YAxisProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = d3.select(ref.current);
    root.selectAll('*').remove();
    root.append('g').call(d3.axisLeft(scale));
  }, [ref, scale]);

  return <g ref={ref}></g>;
}

function hoverPointForX(x: number | null, data: RunScalarsData) {
  if (x === null) {
    return null;
  }
  const i = Math.min(d3.bisect(data.x, x), data.x.length - 1);
  return [data.x[i], data.y[i]];
}

type TooltipTableRowProps = {
  data: TooltipData;
};

function TooltipTableRow({ data }: TooltipTableRowProps) {
  const [hover, setHover] = useHover();
  const setCurrent = useSetCurrent();

  const scrollRef = React.useRef(null);

  useScrollHoverIntoView(data.runId, scrollRef);

  return (
    <tr
      ref={scrollRef}
      style={{
        backgroundColor:
          hover === data.runId
            ? 'var(--joy-palette-background-level2)'
            : undefined,
        scrollMargin: '2rem',
        cursor: 'pointer'
      }}
      onClick={e => {
        setCurrent(data.runId);
      }}
      onMouseEnter={e => {
        setHover(data.runId);
      }}
      onMouseLeave={e => {
        setHover(null);
      }}
    >
      <td>
        <div
          style={{
            height: '1rem',
            width: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: seriesColorForRun(data.runId),
            opacity: 0.8
          }}
        />
      </td>
      <td>{data.runId.slice(0, 8)}</td>
      <td>{formatScalar(data.value)}</td>
      <td>{data.step !== undefined ? data.step : ''}</td>
    </tr>
  );
}

type TooltipData = {
  runId: string;
  value: number | undefined;
  step: number | undefined;
};

function tooltipDataForScalars(
  data: RunScalarsData[],
  hoverX: number | null,
  sortDesc: boolean
): TooltipData[] {
  return data
    .map(runData => tooltipDataForRun(runData, hoverX))
    .sort((lhs, rhs) => cmp(lhs.value, rhs.value, sortDesc));
}

function tooltipDataForRun(
  runData: RunScalarsData,
  hoverX: number | null
): TooltipData {
  const hoverPoint = hoverPointForX(hoverX, runData);
  const [value, step] = hoverPoint
    ? [hoverPoint[1], hoverPoint[0]]
    : [undefined, undefined];

  return {
    runId: runData.runId,
    value,
    step
  };
}

type ScalarPlotTooltipProps = {
  children: TooltipProps['children'];
  data: RunScalarsData[];
  hoverX: number | null;
};

function ScalarPlotTooltip({ data, hoverX, children }: ScalarPlotTooltipProps) {
  const [desc, setDesc] = React.useState<boolean>(false);

  const tooltipData = tooltipDataForScalars(data, hoverX, desc);

  return (
    <Tooltip
      enterDelay={200}
      enterNextDelay={200}
      leaveDelay={200}
      title={
        <Box
          sx={{
            maxHeight: '12rem',
            overflowY: 'auto',
            ...SX_VSCROLL_THIN
          }}
        >
          <Table
            size="sm"
            variant="plain"
            borderAxis="none"
            stickyHeader
            hoverRow
            sx={{
              '--TableCell-headBackground':
                'var(--joy-palette-neutral-solidBg)',
              '--TableCell-paddingX': '0.5rem',
              '--TableCell-paddingY': 0,
              '--TableCell-height': `1.6rem`,
              width: 'unset',
              cursor: 'default'
            }}
          >
            <thead>
              <tr style={{ lineHeight: '1.5rem' }}>
                <th></th>
                <th>Run</th>
                <th>
                  <Link
                    underline="none"
                    component="button"
                    onClick={() => setDesc(!desc)}
                    sx={{
                      color: 'unset',
                      fontWeight: 'unset'
                    }}
                    endDecorator={
                      <ArrowUpwardIcon
                        sx={{
                          height: '0.85rem',
                          transform: desc ? 0 : 'rotate(180deg)'
                        }}
                      />
                    }
                  >
                    Value
                  </Link>
                </th>
                <th>Step</th>
              </tr>
            </thead>
            <tbody>
              {tooltipData.map(data => (
                <TooltipTableRow key={data.runId} data={data} />
              ))}
            </tbody>
          </Table>
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
}

type ScalarSeriesProps = {
  data: RunScalarsData;
  xScale: (arg0: number) => number;
  yScale: (arg0: number) => number;
  hoverX: number | null;
};

function ScalarSeries({ data, xScale, yScale, hoverX }: ScalarSeriesProps) {
  const [hover, setHover] = useHover();
  const current = useCurrent();
  const setCurrent = useSetCurrent();

  const thisCurrent = current === data.runId;
  const thisHover = hover === data.runId;

  const xyData: [number, number][] = data.x.map((xVal, i) => [xVal, data.y[i]]);

  const lineGen = d3
    .line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  const linePath = lineGen(xyData);

  const seriesColor = seriesColorForRun(data.runId);

  const hoverPoint = hoverPointForX(hoverX, data);

  return linePath ? (
    <g>
      <path
        d={linePath}
        opacity={thisHover || thisCurrent ? 1.0 : 0.5}
        strokeWidth={thisHover ? 2.5 : 1.5}
        stroke={seriesColor}
        fill="none"
      />
      {xyData.length === 1 && (
        <circle
          r={4}
          cx={xScale(xyData[0][0])}
          cy={yScale(xyData[0][1])}
          fill={seriesColor}
        />
      )}
      {hoverPoint && (
        <circle
          r={2.5}
          cx={xScale(hoverPoint[0])}
          cy={yScale(hoverPoint[1])}
          fill={seriesColor}
        />
      )}
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

function useHoverX(
  xScale: d3.ScaleContinuousNumeric<number, number>,
  xOffset: number
): [number | null, React.MouseEventHandler] {
  const [val, set] = React.useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const mouseX = d3.pointer(e)[0] - xOffset;
    set(xScale.invert(mouseX));
  };

  return [val, handleMouseMove];
}

function useSeriesSortedData(data: RunScalarsData[]): RunScalarsData[] {
  const [hover] = useHover();
  if (!hover) {
    return data;
  }
  // Place hover series last so they render above other series.
  return [...data].sort((lhs, rhs) =>
    lhs.runId === hover ? 1 : rhs.runId === hover ? -1 : 0
  );
}

type ScalarPlotProps = {
  scalar: string;
  height?: number;
  logScale?: boolean;
  sx?: SxProps;
};

export default function ScalarPlot({
  scalar,
  height: heightProp,
  logScale,
  sx
}: ScalarPlotProps) {
  const data = useScalarData(scalar);
  const seriesSortedData = useSeriesSortedData(data);

  const rootRef = React.useRef(null);

  const dim = useRect(rootRef);

  const width = dim ? dim.width : 240;
  const height = heightProp || 240;

  const margin = { top: 10, right: 10, bottom: 20, left: 50 };

  const boundsWidth = width - margin.right - margin.left;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = initXScale(data, boundsWidth);
  const yScale = initYScale(data, boundsHeight, logScale);

  const [hoverX, hoverXHandler] = useHoverX(xScale, margin.left);

  return (
    <Box ref={rootRef} sx={sx}>
      <ScalarPlotTooltip data={data} hoverX={hoverX}>
        <svg width={width} height={height} onMouseMove={hoverXHandler}>
          <g
            width={boundsWidth}
            height={boundsHeight}
            transform={`translate(${[margin.left, margin.top].join(',')})`}
          >
            <XAxis scale={xScale} height={boundsHeight} />
            <YAxis scale={yScale} />
            {seriesSortedData.map(runData => (
              <ScalarSeries
                key={runData.runId}
                data={runData}
                xScale={xScale}
                yScale={yScale}
                hoverX={hoverX}
              />
            ))}
          </g>
        </svg>
      </ScalarPlotTooltip>
    </Box>
  );
}
