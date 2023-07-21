// import { ReactECharts, EChartsOption } from '../components/ReactECharts';
// import { useHover } from '../highlight';
// import { useSetCurrent } from '../selection';
// import { useSummariesCompare } from '../summaries';
// import { RunsCompare, RunCompareData } from '../types';

// type ParallelAxis = EChartsOption['parallelAxis'];

// export default function ParallelCoordinates() {
//   const compare = useSummariesCompare() || {};

//   const setCurrent = useSetCurrent();
//   const [,setHover] = useHover();

//   const parallelAxis = chartParallelAxis(compare);
//   const data = chartData(compare, parallelAxis);

//   const option: EChartsOption = {
//     animation: false,
//     brush: {
//       brushLink: 'all',
//       outOfBrush: {
//         opacity: 0.15
//       },
//       toolbox: ['clear']
//     },
//     parallelAxis,
//     series: {
//       type: 'parallel',
//       lineStyle: {
//         width: 2
//       },
//       data
//     },
//     tooltip: {
//       trigger: 'item',
//       formatter: (params: any) => {
//         return params.data[0];
//       }
//     }
//   };

//   const handleClick = (params: any) => {
//     const runId = params.value[0];
//     setCurrent(runId);
//   };

//   const handleMouseOver = (params: any) => {
//     const runId = params.value[0];
//     setHover(runId);
//   };

//   const handleMouseOut = (params: any) => {
//     setHover(null);
//   };

//   return (
//     <ReactECharts
//       option={option}
//       style={{ height: '400px' }}
//       onClick={handleClick}
//       onMouseOver={handleMouseOver}
//       onMouseOut={handleMouseOut}
//     />
//   );
// }

// function chartParallelAxis(compare: RunsCompare): ParallelAxis {
//   const axis: any[] = [];
//   applyFlags(compare, axis);
//   applyScalars(compare, axis);
//   return axis;
// }

// function applyFlags(compare: RunsCompare, axis: any[]) {
//   const names = sortedKeys(compare, 'flags');
//   names.forEach(name => {
//     axis.push({
//       dim: axis.length + 1,
//       name,
//       readVal: (row: RunCompareData) => row.flags[name]
//     });
//   });
// }

// function sortedKeys(compare: RunsCompare, attr: 'flags' | 'scalars') {
//   const names = new Set<string>();
//   Object.keys(compare).forEach(runId => {
//     Object.keys(compare[runId][attr]).forEach(name => {
//       names.add(name);
//     });
//   });
//   return Array.from(names).sort();
// }

// function applyScalars(compare: RunsCompare, axis: any[]) {
//   const names = sortedKeys(compare, 'scalars');
//   names.forEach(name => {
//     axis.push({
//       dim: axis.length + 1,
//       name,
//       readVal: (row: RunCompareData) => {
//         const s = row.scalars[name];
//         return s ? s.lastVal : null;
//       }
//     });
//   });
// }

// function chartData(compare: RunsCompare, axis: ParallelAxis): any[][] {
//   return Object.keys(compare).map(runId => {
//     const runCompare: RunCompareData = compare[runId];
//     const vals = (axis as any[]).map(x => x.readVal(runCompare));
//     return [runId, ...vals];
//   });
// }

export default function ParallelCoordinates() {
  return <>TODO - parallel coordinates plot</>;
}
