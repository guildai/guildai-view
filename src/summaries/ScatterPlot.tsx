// import { Stack } from '@mui/joy';

// import { EChartsOption, ReactECharts } from '../components/ReactECharts';
// import Panel from '../components/Panel';

// import { useScalarNames } from '../summaries';

// import { useSetCurrent } from '../selection';
// import { useHover } from '../highlight';

// import { isNumber } from '../utils';

// import { RunCompareData, RunsCompare } from '../types';

// type RunValReader = (run: RunCompareData) => number;

// type ScalarToFlagPlotProps = {
//   scalar: string;
//   flag: string;
//   compare: RunsCompare;
// };

// function ScalarToFlagPlot({ scalar, flag, compare }: ScalarToFlagPlotProps) {
//   const setCurrent = useSetCurrent();
//   const [, setHover] = useHover();

//   const option: EChartsOption = {
//     animation: false,
//     xAxis: {},
//     yAxis: { name: flag },
//     tooltip: {
//       trigger: 'item',
//       formatter: (params: any) =>
//         `${params.value[2]}<br>
//         ${flag}: ${params.value[0]}<br>
//         ${scalar}: ${params.value[1]}`
//     },
//     series: [
//       {
//         symbolSize: 5,
//         data: runPairs(
//           compare,
//           (run: RunCompareData) => run.flags[flag],
//           (run: RunCompareData) => run.scalars[scalar]?.lastVal
//         ),
//         type: 'scatter'
//       }
//     ]
//   };

//   const handleClick = (params: any) => {
//     const runId = params.value[2];
//     setCurrent(runId);
//   };

//   const handleMouseOver = (params: any) => {
//     const runId = params.value[2];
//     setHover(runId);
//   };

//   const handleMouseOut = (params: any) => {
//     setHover(null);
//   };

//   return (
//     <ReactECharts
//       option={option}
//       style={{ height: '300px', width: '300px' }}
//       onClick={handleClick}
//       onMouseOver={handleMouseOver}
//       onMouseOut={handleMouseOut}
//     />
//   );
// }

// type ScalarPlotsProps = {
//   scalar: string;
//   compare: RunsCompare;
// };

// function ScalarPlots({ scalar, compare }: ScalarPlotsProps) {
//   return (
//     <Stack direction="row">
//       {numericFlags(compare).map(flag => (
//         <ScalarToFlagPlot key={flag} scalar={scalar} flag={flag} compare={compare} />
//       ))}
//     </Stack>
//   );
// }

// function numericFlags(compare: RunsCompare): string[] {
//   const flags = new Set<string>();
//   Object.keys(compare).forEach(runId => {
//     Object.keys(compare[runId].flags).forEach(flagName => {
//       if (isNumber(compare[runId].flags[flagName])) {
//         flags.add(flagName);
//       }
//     });
//   });
//   return Array.from(flags).sort();
// }

// export default function ScatterPlot() {
//   const compare = useSummariesCompare() || {};

//   return (
//     <Stack>
//       {scalarsForCompare(compare).map(s => (
//         <Panel key={s} title={s} headerStyle="plain">
//           <ScalarPlots scalar={s} compare={compare} />
//         </Panel>
//       ))}
//     </Stack>
//   );
// }

// function runPairs(compare: RunsCompare, f1: RunValReader, f2: RunValReader) {
//   return Object.keys(compare)
//     .sort()
//     .map(runId => {
//       const run = compare[runId];
//       return [f1(run), f2(run), runId];
//     });
// }

export default function ScatterPlot() {
  return <>TODO - scatter plot</>;
}
