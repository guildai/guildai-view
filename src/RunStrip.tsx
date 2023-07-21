import React from 'react';

import { Stack } from '@mui/joy';

import LazyLoad from './components/LazyLoad';

import RunCard from './RunCard';

import { useOrderedRuns } from './runs';

type RunStripProps = {
  lazyRoot: React.RefObject<HTMLElement>;
}

export default function RunStrip({lazyRoot}: RunStripProps) {
  const runs = useOrderedRuns();

  const cardWidth = '8em';

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      {runs.map(run => (
        <LazyLoad
          root={lazyRoot}
          key={run.id}
          sx={{display: 'flex', flexDirection: 'row', alignItems:'stretch'}}
          children={lazy => (
            <RunCard
              run={run}
              lazy={lazy}
              size="sm"
              sx={{ maxWidth: cardWidth, minWidth: cardWidth }}
            />
          )}
        />
      ))}
    </Stack>
  );
}
