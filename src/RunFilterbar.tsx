import React from 'react';

import { Button, IconButton, Input, Stack } from '@mui/joy';

import { Close } from '@mui/icons-material';

import KeyDownBoundary from './components/KeyDownBoundary';
import Labeled from './components/Labeled';
import { Select, Option } from './components/Select';
import ToggleList from './components/ToggleList';
import Tooltip from './components/Tooltip';

import {
  CompletedIcon,
  ErrorIcon,
  PendingIcon,
  StaticRunningIcon,
  TerminatedIcon
} from './RunStatusIcon';

import {
  useClearFilters,
  useOperationFilter,
  useOperations,
  useStartedFilter,
  useStatusFilter,
  useTextFilter
} from './runs';

import { assert, useRefreshListener } from './utils';

import { RunStatus } from './types';

function RunStatusFilter() {
  const [selected, setSelected] = useStatusFilter();

  const iconSx = { width: '1em', height: '1em' };

  return (
    <Labeled
      label="Status"
      tooltip="Filter runs by status"
      gap="0.25em"
      sx={{ ml: 1 }}
    >
      <ToggleList
        selected={componentSelected(selected)}
        tooltipPlacement="bottom-start"
        onChange={e => {
          const status = statusForValue(e.target.value);
          if (e.target.checked) {
            setSelected([...status, ...selected]);
          } else {
            setSelected(selected.filter(x => !status.includes(x)));
          }
        }}
        items={[
          {
            value: 'completed',
            tooltip: 'Completed',
            icon: <CompletedIcon sx={iconSx} />
          },
          {
            value: 'running',
            tooltip: 'Running',
            icon: <StaticRunningIcon sx={iconSx} />
          },
          {
            value: 'terminated',
            tooltip: 'Terminated',
            icon: <TerminatedIcon sx={iconSx} />
          },
          {
            value: 'error',
            tooltip: 'Error',
            icon: <ErrorIcon sx={iconSx} />
          },
          {
            value: 'staged_or_pending',
            tooltip: 'Staged or pending',
            icon: <PendingIcon sx={iconSx} />
          }
        ]}
      />
    </Labeled>
  );
}

function statusForValue(value: string): RunStatus[] {
  if (value === 'staged_or_pending') {
    return ['staged', 'pending'];
  } else {
    return [value as RunStatus];
  }
}

function componentSelected(selected: RunStatus[]) {
  const statusMap: { [key: string]: string } = {
    staged: 'staged_or_pending',
    pending: 'staged_or_pending'
  };
  return Array.from(
    new Set(selected.map(status => statusMap[status] || status))
  );
}

function RunOperationFilter() {
  const [operations, refreshOperations] = useOperations();
  const [filters, setFilters] = useOperationFilter();

  useRefreshListener(refreshOperations);

  return (
    <Select
      placeholder="Operation"
      clearable
      clearTooltip="Clear filter"
      value={filters.length ? filters[0] : null}
      onChange={(e, value) => setFilters(value ? [value] : [])}
      sx={{ minWidth: '8em' }}
    >
      {(operations || []).map(op => (
        <Option key={op} value={op}>
          {op}
        </Option>
      ))}
    </Select>
  );
}

function RunDateFilter() {
  const [filter, setFilter] = useStartedFilter();

  return (
    <Select
      clearable
      clearTooltip="Clear filter"
      placeholder="Started"
      value={filter}
      sx={{ minWidth: '10em' }}
      onChange={(e, value) => setFilter(value)}
    >
      <Option value="last hour">Last hour</Option>
      <Option value="today">Today</Option>
      <Option value="yesterday">Yesterday</Option>
      <Option value="this week">This week</Option>
      <Option value="before this week">Before this week</Option>
    </Select>
  );
}

function ClearTextFilterButton() {
  const [, setFilter] = useTextFilter();

  return (
    <IconButton
      role="close-tab"
      color="neutral"
      variant="plain"
      size="sm"
      sx={{
        '--IconButton-size': '22px',
        '--IconButton-radius': '10px',
        '--Icon-color': theme => theme.vars.palette.neutral.solidBg,
        background: 'transparent'
      }}
      onClick={e => {
        (e.target as HTMLElement).blur();
        setFilter(null);
      }}
    >
      <Close />
    </IconButton>
  );
}

function RunTextFilter() {
  const [filter, setFilter] = useTextFilter();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      const input = (ref.current as HTMLElement).getElementsByTagName(
        'input'
      )[0];
      assert(input);
      input.value = filter || '';
    }
  }, [filter]);

  return (
    <KeyDownBoundary>
      <Input
        ref={ref}
        size="sm"
        placeholder="Filter"
        slotProps={{
          input: {
            sx: {
              width: '8em',
              transition: 'min-width 0.4s ease',
              ':focus': { minWidth: '16em' }
            }
          }
        }}
        onBlur={e => {
          const inputVal = (e.target as HTMLInputElement).value;
          if (inputVal !== filter) {
            setFilter(inputVal || null);
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            (e.target as HTMLElement).blur();
          } else if (e.key === 'Escape') {
            (e.target as HTMLInputElement).value = filter || '';
            (e.target as HTMLElement).blur();
          }
        }}
        endDecorator={<ClearTextFilterButton />}
      />
    </KeyDownBoundary>
  );
}

function RunClearFilters() {
  const [activeFilters, clearFilters] = useClearFilters();

  const handleClick = (e: any) => {
    clearFilters();
    (e.target as HTMLElement).blur();
  };

  return (
    <Tooltip title="Clear the filters">
      <Button
        color="neutral"
        variant="outlined"
        size="sm"
        onClick={handleClick}
        sx={{ fontWeight: 'unset' }}
        disabled={!activeFilters}
      >
        Clear
      </Button>
    </Tooltip>
  );
}

export default function RunFilterbar() {
  return (
    <KeyDownBoundary navOnly>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <RunStatusFilter />
        <RunOperationFilter />
        <RunDateFilter />
        <RunTextFilter />
        <RunClearFilters />
      </Stack>
    </KeyDownBoundary>
  );
}
