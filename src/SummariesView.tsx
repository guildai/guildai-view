import React from 'react';

import {
  Card,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/joy';

import { Fullscreen, FullscreenExit } from '@mui/icons-material';

import Conditional from './components/Conditional';
import KeyDownBoundary from './components/KeyDownBoundary';
import Labeled from './components/Labeled';
import Toolbar, { ToolbarSpacer } from './components/Toolbar';
import ToolbarButton from './components/ToolbarButton';
import { ViewTabList } from './components/ViewTabs';

import LogScale from './icons/LogScale';

import { MainViewContent, MainViewFooter, MainViewHeader } from './MainView';
import MainViewToolbar from './MainViewToolbar';
import RunFilterbar from './RunFilterbar';

import ParallelCoordinates from './summaries/ParallelCoordinates';
import ScatterPlot from './summaries/ScatterPlot';
import ScalarPlot from './summaries/ScalarPlot';
import RunImages from './summaries/RunImages';

import RunSortSelect from './RunSortSelect';

import { useScalarNames } from './summaries';
import { useOrderedRuns, useSelectedRuns } from './runs';

import { useCurrent, useSetCurrent } from './selection';
import { useHover } from './highlight';
import { defaultSummariesView } from './prefs';
import { useMainView } from './mainView';

import { Run } from './types';

const tabSx = { flexGrow: 0, scrollMargin: '8px' };
const tabBlur: React.MouseEventHandler = e => (e.target as HTMLElement).blur();

function Config() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      <Labeled label="Sort">
        <RunSortSelect />
      </Labeled>
    </Stack>
  );
}

type SummariesTabsProps = {
  view: string;
  onChange: (value: string) => void;
};

function SummariesTabs({ view, onChange }: SummariesTabsProps) {
  return (
    <Tabs
      selectionFollowsFocus
      value={view}
      onChange={(e, val) => onChange(val as string)}
      sx={{ backgroundColor: 'unset', flexGrow: 1, overflow: 'hidden' }}
    >
      <ViewTabList>
        <Tab value="visualizations" sx={tabSx} onClick={tabBlur}>
          Visualizations
        </Tab>
        <Tab value="scalars" sx={tabSx} onClick={tabBlur}>
          Scalars
        </Tab>
        <Tab value="images" sx={tabSx} onClick={tabBlur}>
          Images
        </Tab>
        <Tab value="text" sx={tabSx} onClick={tabBlur}>
          Text
        </Tab>
      </ViewTabList>
    </Tabs>
  );
}

function Visualizations() {
  return (
    <Stack gap={2} p={1}>
      <Card variant="outlined">
        <Typography level="h5">Parallel Coordinates Plot</Typography>
        <ParallelCoordinates />
      </Card>
      <Card variant="outlined">
        <Typography level="h5">Scatter Plot</Typography>
        <ScatterPlot />
      </Card>
    </Stack>
  );
}

type ScalarGridProps = {
  scalar: string;
};

function ScalarGrid({ scalar }: ScalarGridProps) {
  const [log, setLog] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Grid md={12} lg={expanded ? 12 : 6} p={0.5}>
      <Card variant="outlined" sx={{ gap: 0, pb: 1 }}>
        <Typography level="h6">{scalar}</Typography>
        <ScalarPlot scalar={scalar} logScale={log} sx={{ width: '100%' }} />
        <Toolbar>
          <ToolbarButton
            tooltip="Use logarithmic scale"
            icon={<LogScale />}
            selected={log}
            onClick={() => setLog(!log)}
          />
          <ToolbarSpacer />
          <ToolbarButton
            tooltip={expanded ? 'Shrink plot' : 'Expand plot'}
            icon={expanded ? <FullscreenExit /> : <Fullscreen />}
            onClick={() => setExpanded(!expanded)}
          />
        </Toolbar>
      </Card>
    </Grid>
  );
}

function Scalars() {
  const scalars = useScalarNames();
  return (
    <Grid container p={0.5}>
      {scalars.map(scalar => (
        <ScalarGrid key={scalar} scalar={scalar} />
      ))}
    </Grid>
  );
}

function Images() {
  const [selected] = useSelectedRuns();
  const ordered = useOrderedRuns();
  const runs = selected.length ? selected : ordered;

  const current = useCurrent();
  const setCurrent = useSetCurrent();
  const [hover, setHover] = useHover();
  const [, setView] = useMainView();

  return (
    <Stack gap={2} p={1}>
      {runs.map((run: Run) => (
        <Card
          key={run.id}
          variant="outlined"
          sx={{
            cursor: 'pointer',
            bgcolor:
              run.id === current
                ? 'var(--joy-palette-background-level2)'
                : undefined,
            borderColor:
              hover === run.id ? 'var(--joy-palette-neutral-400)' : undefined
          }}
          onClick={() => setCurrent(run.id)}
          onMouseEnter={() => setHover(run.id)}
          onMouseLeave={() => setHover(null)}
          onDoubleClick={() => setView('run')}
        >
          <RunImages run={run} />
        </Card>
      ))}
    </Stack>
  );
}

function Text() {
  return <>TODO: text</>;
}

export default function SummariesView() {
  const [view, setView] = React.useState<string>(defaultSummariesView);

  return (
    <>
      <MainViewHeader>
        <RunFilterbar />
      </MainViewHeader>
      <MainViewContent>
        <Stack
          sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
        >
          <KeyDownBoundary navOnly>
            <SummariesTabs view={view} onChange={setView} />
          </KeyDownBoundary>
          <Divider />
          <div style={{ overflow: 'auto', position: 'relative' }}>
            <Conditional active={view === 'visualizations'}>
              <Visualizations />
            </Conditional>
            <Conditional active={view === 'scalars'}>
              <Scalars />
            </Conditional>
            <Conditional active={view === 'images'}>
              <Images />
            </Conditional>
            <Conditional active={view === 'text'}>
              <Text />
            </Conditional>
          </div>
        </Stack>
      </MainViewContent>
      <MainViewFooter>
        <MainViewToolbar endDecorator={<Config />} />
      </MainViewFooter>
    </>
  );
}
