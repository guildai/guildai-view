import React from 'react';

import { Card, Link, Stack, Table, Typography } from '@mui/joy';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import Tooltip from './components/Tooltip';
import Labeled from './components/Labeled';

import NoRunsView from './NoRunsView';
import RunFilterbar from './RunFilterbar';
import RunLink from './RunLink';
import RunOperationLabel from './RunOperationLabel';
import RunSortSelect from './RunSortSelect';
import RunStatusIcon from './RunStatusIcon';

import { MainViewContent, MainViewFooter, MainViewHeader } from './MainView';
import MainViewToolbar from './MainViewToolbar';

import {
  runStatusLabel,
  useOrderedRuns,
  useRunsCompare,
  useSort
} from './runs';

import { useHover } from './highlight';
import { useScrollIntoView, useKeySelectedClicked } from './selection';

import { useMainView } from './mainView';

import {
  disableShiftSelect,
  formatFlagValue,
  formatRunDate,
  formatRunDuration,
  formatScalar,
  isRunId,
  runsCompareFlagNames,
  runsCompareScalarNames
} from './utils';

import {
  Run,
  RunCompareData,
  RunSort,
  RunSortType,
  RunsCompare
} from './types';

function Config() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      <Labeled label="Sort">
        <RunSortSelect />
      </Labeled>
    </Stack>
  );
}

type Col = {
  label: string;
  cell: (arg0: Run, arg1?: RunCompareData) => React.ReactNode;
  sortType: RunSortType;
  sortName: string;
  key: string;
};

type RunRowProps = {
  run: Run;
  compare?: RunCompareData;
  cols: Col[];
};

function RunRow({ run, compare, cols }: RunRowProps) {
  const [selected, current, clicked] = useKeySelectedClicked(run.id);
  const [, setView] = useMainView();
  const [, setHover] = useHover();

  const ref = React.useRef<HTMLTableRowElement>(null);
  useScrollIntoView(run.id, ref);

  return (
    <tr
      ref={ref}
      role="row" // needed for correct scroll-into-view behavior
      style={{
        cursor: 'pointer',
        backgroundColor: rowBackgroundColor(selected, current),
        scrollMargin: '40px'
      }}
      onMouseDown={disableShiftSelect}
      onClick={e => {
        clicked(e);
      }}
      onDoubleClick={() => setView('run')}
      onMouseEnter={() => {
        setHover(run.id);
      }}
      onMouseLeave={() => {
        setHover(null);
      }}
    >
      {cols.map(col => (
        <td key={col.key}>{col.cell(run, compare)}</td>
      ))}
    </tr>
  );
}

function rowBackgroundColor(selected: boolean, current: boolean) {
  if (current) {
    return 'var(--joy-palette-background-level3)';
  } else if (selected) {
    return 'var(--joy-palette-background-level2)';
  } else {
    return undefined;
  }
}

function RunsTable({ runs }: { runs: Run[] }) {
  const compare = useRunsCompare();
  const cols = tableColumns(compare);
  const [sort, setSort] = useSort();

  return (
    <Card
      variant="outlined"
      sx={{
        m: 1,
        overflow: 'auto',
        p: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }}
    >
      <Table
        hoverRow
        stickyHeader
        sx={{
          width: 'unset',
          'tbody tr:hover': {
            outline: '1px solid var(--joy-palette-info-300)',
            backgroundColor: 'unset'
          }
        }}
      >
        <thead>
          <tr>
            {cols.map(col => {
              const active = isActiveCol(col, sort);
              return (
                <th key={col.key}>
                  <Link
                    underline="none"
                    color="neutral"
                    textColor={active ? 'primary.plainColor' : undefined}
                    component="button"
                    onClick={() => handleColClick(col, sort, setSort)}
                    endDecorator={
                      <ArrowUpwardIcon
                        sx={{
                          height: '0.85rem',
                          opacity: active ? 1 : 0,
                          transform: sort.desc ? 0 : 'rotate(180deg)'
                        }}
                      />
                    }
                  >
                    {col.label}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <RunRow
              key={run.id}
              run={run}
              compare={compare ? compare[run.id] : undefined}
              cols={cols}
            />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function isActiveCol(col: Col, sort: RunSort): boolean {
  return col.sortType === sort.type && col.sortName === sort.name;
}

function handleColClick(
  col: Col,
  sort: RunSort,
  setSort: (arg0: RunSort) => void
) {
  const desc =
    col.sortType === sort.type && col.sortName === sort.name
      ? !sort.desc
      : defaultColDesc(col);
  setSort({ type: col.sortType, name: col.sortName, desc });
}

function defaultColDesc(col: Col) {
  return col.sortType === 'attr' && col.sortName === 'started';
}

function tableColumns(compare: RunsCompare | undefined): Col[] {
  return [...coreColumns(), ...flagColumns(compare), ...scalarColumns(compare)];
}

function coreColumns(): Col[] {
  return [
    {
      label: 'Operation',
      cell: run => (
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <Tooltip title={runStatusLabel(run.status)} placement="top-start">
            <span>
              <RunStatusIcon status={run.status} size="sm" />
            </span>
          </Tooltip>
          <Tooltip title={run.operation} placement="top-start">
            <Typography noWrap>
              <RunOperationLabel run={run} />
            </Typography>
          </Tooltip>
        </Stack>
      ),
      sortType: 'attr',
      sortName: 'operation',
      key: 'attr:operation'
    },
    {
      label: 'Started',
      cell: run => formatRunDate(run.started),
      sortType: 'attr',
      sortName: 'started',
      key: 'attr:started'
    },
    {
      label: 'Duration',
      cell: run => formatRunDuration(run.started, run.stopped),
      sortType: 'attr',
      sortName: 'duration',
      key: 'attr:duration'
    },
    {
      label: 'Label',
      cell: run => run.label,
      sortType: 'attr',
      sortName: 'label',
      key: 'attr:label'
    }
  ];
}

function flagColumns(compare: RunsCompare | undefined): Col[] {
  if (!compare) {
    return [];
  }
  return runsCompareFlagNames(compare)
    .sort()
    .map(name => ({
      label: name,
      cell: (run, compare) => (compare ? formatFlag(compare.flags[name]) : ''),
      sortType: 'flag',
      sortName: name,
      key: `flag:${name}`
    }));
}

function formatFlag(val: any) {
  return isRunId(val) ? (
    <RunLink runId={val as string} />
  ) : (
    formatFlagValue(val)
  );
}

function scalarColumns(compare: RunsCompare | undefined): Col[] {
  if (!compare) {
    return [];
  }
  return runsCompareScalarNames(compare)
    .sort()
    .map(name => ({
      label: name,
      cell: (run, compare) => {
        if (!compare) {
          return '';
        }
        const s = compare.scalars[name];
        return s ? formatScalar(s.lastVal) : '';
      },
      sortType: 'scalar',
      sortName: name,
      key: `scalar:${name}`
    }));
}

export default function TableView() {
  const runs = useOrderedRuns();

  return (
    <>
      <MainViewHeader>
        <RunFilterbar />
      </MainViewHeader>
      <MainViewContent>
        {runs.length ? <RunsTable runs={runs} /> : <NoRunsView />}
      </MainViewContent>
      <MainViewFooter>
        <MainViewToolbar endDecorator={<Config />} />
      </MainViewFooter>
    </>
  );
}
