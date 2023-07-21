import { List, ListItem, Option, Select, Tooltip, Typography } from '@mui/joy';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import { useRunsCompare, useSort } from './runs';

import { RunSort, RunsCompare } from './types';
import { assert, runsCompareFlagNames, runsCompareScalarNames } from './utils';

type SortOpt = RunSort & {
  label: string;
  toggle?: boolean;
};

function useOpts(): [SortOpt[], SortOpt[], SortOpt[]] {
  const compare = useRunsCompare();
  return [coreOpts(), flagOpts(compare || {}), scalarOpts(compare || {})];
}

function coreOpts(): SortOpt[] {
  return [
    { label: 'Latest', type: 'attr', name: 'started', desc: true },
    { label: 'Oldest', type: 'attr', name: 'started', desc: false },
    {
      label: 'Operation',
      type: 'attr',
      name: 'operation',
      desc: true,
      toggle: true
    },
    {
      label: 'Operation',
      type: 'attr',
      name: 'operation',
      desc: false,
      toggle: true
    },
    {
      label: 'Status',
      type: 'attr',
      name: 'status',
      desc: true,
      toggle: true
    },
    {
      label: 'Status',
      type: 'attr',
      name: 'status',
      desc: false,
      toggle: true
    },
    { label: 'Label', type: 'attr', name: 'label', desc: true, toggle: true },
    { label: 'Label', type: 'attr', name: 'label', desc: false, toggle: true },
    { label: 'Shortest', type: 'attr', name: 'duration', desc: false },
    { label: 'Longest', type: 'attr', name: 'duration', desc: true }
  ];
}

function flagOpts(compare: RunsCompare): SortOpt[] {
  return runsCompareFlagNames(compare)
    .sort()
    .reduce<SortOpt[]>(
      (acc, name) => [
        ...acc,
        {
          label: name,
          type: 'flag',
          name: name,
          desc: true,
          toggle: true
        },
        {
          label: name,
          type: 'flag',
          name: name,
          desc: false,
          toggle: true
        }
      ],
      []
    );
}

function scalarOpts(compare: RunsCompare) {
  return runsCompareScalarNames(compare)
    .sort()
    .reduce<SortOpt[]>(
      (acc, name) => [
        ...acc,
        {
          label: name,
          type: 'scalar',
          name: name,
          desc: true,
          toggle: true
        },
        {
          label: name,
          type: 'scalar',
          name: name,
          desc: false,
          toggle: true
        }
      ],
      []
    );
}

function genOpt(
  opt: SortOpt,
  opts: SortOpt[],
  sort: RunSort,
  setSort: (arg0: RunSort) => void
) {
  return (
    showOpt(opt, opts, sort) && (
      <Option
        key={`${opt.type}-${opt.name}-${opt.desc ? 'desc' : 'asc'}`}
        value={opt}
        label={opt.label}
        onClick={() => handleSort(opt, setSort)}
      >
        {opt.label}
        <ArrowUpwardIcon
          sx={{
            ml: 'auto',
            height: '0.85rem',
            opacity: opt.toggle && matchSort(opt, sort) ? 1 : 0,
            transform: sort.desc ? 0 : 'rotate(180deg)'
          }}
        />
      </Option>
    )
  );
}

export default function RunSortSelect() {
  const [sort, setSort] = useSort();
  const [coreOpts, flagOpts, scalarOpts] = useOpts();

  return (
    <Tooltip title="Sort runs">
      <Select
        size="sm"
        sx={{ minWidth: '8em' }}
        value={optForSort(sort, [...coreOpts, ...flagOpts, ...scalarOpts])}
      >
        {coreOpts.map(opt => genOpt(opt, coreOpts, sort, setSort))}
        {scalarOpts.length > 0 && (
          <List>
            <ListItem sticky>
              <Typography level="body3" textTransform="uppercase">
                Scalars
              </Typography>
            </ListItem>
            {scalarOpts.map(opt => genOpt(opt, scalarOpts, sort, setSort))}
          </List>
        )}
        {flagOpts.length > 0 && (
          <List>
            <ListItem sticky>
              <Typography level="body3" textTransform="uppercase">
                Flags
              </Typography>
            </ListItem>
            {flagOpts.map(opt => genOpt(opt, flagOpts, sort, setSort))}
          </List>
        )}
      </Select>
    </Tooltip>
  );
}

function optForSort(sort: RunSort, opts: SortOpt[]): SortOpt | undefined {
  return opts.find(opt => matchSort(opt, sort));
}

function matchSort(opt: SortOpt, sort: RunSort) {
  return (
    opt.type === sort.type && opt.name === sort.name && opt.desc === sort.desc
  );
}

function showOpt(opt: SortOpt, opts: SortOpt[], sort: RunSort) {
  const toggles = opts.filter(
    maybeToggle =>
      maybeToggle.toggle &&
      maybeToggle.type === opt.type &&
      maybeToggle.name === opt.name
  );
  assert(toggles.length === 0 || toggles.length === 2, [opt, opts]);
  return (
    toggles.length === 0 ||
    (toggles.find(t => matchSort(t, sort))
      ? matchSort(opt, sort)
      : isDefaultToggle(opt, toggles as [SortOpt, SortOpt]))
  );
}

function isDefaultToggle(opt: SortOpt, toggles: [SortOpt, SortOpt]) {
  return opt === toggles[0];
}

function handleSort(opt: SortOpt, setSort: (arg0: RunSort) => void) {
  if (opt.toggle) {
    setSort({ ...opt, desc: !opt.desc });
  } else {
    setSort(opt);
  }
}
