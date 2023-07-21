import React from 'react';

import { Box, IconButton, Tab, Tabs } from '@mui/joy';

import { Close } from '@mui/icons-material';

import { ViewTabList } from './components/ViewTabs';

import RunFiles from './RunFiles';
import RunFile from './RunFile';
import RunOutput from './RunOutput';

import { useCurrentRun } from './runs';
import { RunTab, useRunTabs } from './runTabs';
import { ensureVisible } from './utils';

import { Run } from './types';

type CloseButtonProps = {
  active?: boolean;
  onClick?: React.MouseEventHandler;
};

function CloseButton({ active, onClick }: CloseButtonProps) {
  return (
    <IconButton
      role="close-tab"
      color="neutral"
      variant="soft"
      size="sm"
      sx={{
        ml: 0.5,
        mr: -1,
        '--IconButton-size': '20px',
        '--IconButton-radius': '4px',
        '--Icon-color': theme => theme.vars.palette.neutral.solidBg,
        background: 'transparent',
        '&:hover': {
          bgcolor: active ? 'neutral.softActiveBg' : null
        }
      }}
      onClick={onClick}
    >
      <Close />
    </IconButton>
  );
}

export function RunTabs() {
  const run = useCurrentRun();
  const [current, tabs, select, close] = useRunTabs(run);
  const currentRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (currentRef.current) {
      ensureVisible(currentRef.current);
    }
  }, [current]);

  if (!run) {
    return null;
  }

  return (
    <Tabs
      selectionFollowsFocus
      value={current && current.value}
      sx={{ backgroundColor: 'unset', flexGrow: 1, overflow: 'hidden' }}
      onChange={(e, value) => {
        if (e && (e.target as HTMLElement).role === 'tab') {
          select(value as string);
          (e.target as HTMLElement).blur();
        }
      }}
    >
      <ViewTabList>
        {tabs
          .map(tab => tabActive(tab, current))
          .map(({ tab, active }) => (
            <Tab
              key={tab.value}
              ref={active ? currentRef : null}
              value={tab.value}
              sx={{ flexGrow: 0, scrollMargin: '8px' }}
              component="span"
            >
              {tab.label}
              {tab.canClose && (
                <CloseButton
                  active={current && tab.value === current.value}
                  onClick={() => {
                    close(tab.value);
                  }}
                />
              )}
            </Tab>
          ))}
      </ViewTabList>
    </Tabs>
  );
}

function tabActive(tab: RunTab, current: RunTab | undefined) {
  return { tab, active: current && current.value === tab.value };
}

type RunTabViewProps = {
  run: Run;
  tab: RunTab;
};

export function RunTabsView() {
  const run = useCurrentRun();
  const [current, tabs] = useRunTabs(run);

  if (!run || !current) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', p: 0, overflow: 'auto', flexGrow: 1 }}>
      {tabs.map(tab => (
        <Box
          key={tab.value}
          sx={{
            display: tab.value !== current.value ? 'none' : 'flex',
            flexGrow: 1
          }}
        >
          <RunTabView run={run} tab={tab} />
        </Box>
      ))}
    </Box>
  );
}

function RunTabView({ run, tab }: RunTabViewProps) {
  if (tab.value === 'files') {
    return <RunFiles run={run} />;
  } else if (tab.value === 'output') {
    return <RunOutput run={run} />;
  } else if (tab.value.startsWith('file:')) {
    const path = tab.value.substring(5);
    return <RunFile run={run} path={path} />;
  } else {
    return <div>Unsupported tab {tab.value}</div>;
  }
}
