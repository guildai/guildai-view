import React from 'react';

import { Box, CssBaseline, CssVarsProvider, Grid } from '@mui/joy';

import { enableMapSet } from 'immer';

import AppToolbar from './AppToolbar';
import MainView from './MainView';
import PrimarySidebar from './PrimarySidebar';
import RunStrip from './RunStrip';
import RunSidebar from './RunSidebar';

import { useAppInit as useCoreAppInit } from './app';
import { useAppInit as useSelectionAppInit } from './selection';
import { useAppInit as useRunsAppInit } from './runs';
import { useAppInit as useRunTabsAppInit } from './runTabs';
import { useAppInit as useMainViewAppInit } from './mainView';

import { darkMode } from './prefs';
import { usePrimarySidebarVisible, useRunStripVisible } from './app';
import { useEscToClearFocus } from './utils';

import theme from './theme';

function useAppInit() {
  useCoreAppInit();
  useRunsAppInit();
  useSelectionAppInit();
  useMainViewAppInit();
  useRunTabsAppInit();
  useEscToClearFocus();
}

export default function App() {
  enableMapSet();
  useAppInit();

  const [runStripVisible] = useRunStripVisible();
  const [primarySidebarVisible] = usePrimarySidebarVisible();

  const gridLayout = (() => {
    if (!primarySidebarVisible) {
      return {
        primarySidebar: {},
        mainView: { xs: 7, sm: 7, md: 7, lg: 8, xl: 9 },
        runSidebar: { xs: 5, sm: 5, md: 5, lg: 4, xl: 3 }
      };
    }
    return {
      primarySidebar: { xs: 2, md: 3, lg: 2, xl: 2 },
      mainView: { xs: 5, md: 5, lg: 7, xl: 7 },
      runSidebar: { xs: 5, md: 4, lg: 3, xl: 3 }
    };
  })();

  const runStripRef = React.useRef<HTMLDivElement>(null);

  return (
    <CssVarsProvider
      disableTransitionOnChange
      theme={theme}
      defaultMode={darkMode ? 'dark' : 'light'}
    >
      <CssBaseline />
      <Box sx={{ display: 'flex', flexFlow: 'column', height: '100vh' }}>
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 1,
            mr: 1 /* HACK to address missing right padding */,
            overflowX: 'auto'
          }}
        >
          <AppToolbar />
        </Box>
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          <Grid container sx={{ height: '100%' }}>
            {primarySidebarVisible && (
              <Grid
                sx={{
                  bgcolor: 'background.surface',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  overflowY: 'hidden'
                }}
                {...gridLayout.primarySidebar}
              >
                <PrimarySidebar />
              </Grid>
            )}
            <Grid
              sx={{
                height: '100%',
                overflowY: 'hidden'
              }}
              {...gridLayout.mainView}
            >
              <MainView />
            </Grid>
            <Grid
              sx={{
                bgcolor: 'background.surface',
                borderLeft: '1px solid',
                borderColor: 'divider',
                height: '100%',
                overflowY: 'hidden'
              }}
              {...gridLayout.runSidebar}
            >
              <RunSidebar />
            </Grid>
          </Grid>
        </Box>
        {runStripVisible && (
          <Box
            ref={runStripRef}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              p: 1,
              mr: 1 /* HACK to address missing right padding */,
              overflowX: 'auto'
            }}
          >
            <RunStrip lazyRoot={runStripRef} />
          </Box>
        )}
      </Box>
    </CssVarsProvider>
  );
}
