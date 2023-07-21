import { Box, Card, Divider, Stack, Typography } from '@mui/joy';

import EmptyView from './components/EmptyView';
import KeyDownBoundary from './components/KeyDownBoundary';
import Tooltip from './components/Tooltip';

import RunOperationLabel from './RunOperationLabel';
import { RunTabs, RunTabsView } from './RunTabs';
import RunStatusIcon from './RunStatusIcon';

import { MainViewContent, MainViewFooter } from './MainView';
import MainViewToolbar from './MainViewToolbar';

import { runStatusLabel, useCurrentRun } from './runs';
import { formatRunDate } from './utils';

import { Run } from './types';

type RunHeaderProps = {
  run: Run;
};

function Header({ run }: RunHeaderProps) {
  return (
    <Box m={1}>
      <Stack direction="row" alignItems="center" spacing={0.7}>
        <Tooltip title={runStatusLabel(run.status)} placement="bottom-start">
          <span>
            <RunStatusIcon size="lg" status={run.status} />
          </span>
        </Tooltip>
        <Typography fontSize="md" noWrap>
          <RunOperationLabel run={run} />
        </Typography>
      </Stack>
      <Typography fontSize="sm" textColor="text.tertiary" noWrap>
        {formatRunDate(run.started)}
      </Typography>
      <Tooltip title={run.label} placement="bottom-start">
        <Typography fontSize="sm" textColor="text.secondary" noWrap>
          {run.label}
        </Typography>
      </Tooltip>
    </Box>
  );
}

export default function RunView() {
  const run = useCurrentRun();

  return (
    <>
      <MainViewContent>
        {run ? (
          <Card
            variant="outlined"
            sx={{
              m: 1,
              p: 0,
              gap: 0,
              position: 'absolute',
              overflow: 'hidden',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0
            }}
          >
            <Header run={run} />
            <KeyDownBoundary navOnly>
              <RunTabs />
            </KeyDownBoundary>
            <Divider />
            <RunTabsView />
          </Card>
        ) : (
          <EmptyView>Select a run to view</EmptyView>
        )}
      </MainViewContent>
      <MainViewFooter>
        <MainViewToolbar />
      </MainViewFooter>
    </>
  );
}
