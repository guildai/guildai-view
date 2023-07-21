import React from 'react';

import { Divider, Grid, Slider, Stack } from '@mui/joy';

import KeyDownBoundary from './components/KeyDownBoundary';
import Labeled from './components/Labeled';
import LazyLoad from './components/LazyLoad';
import Tooltip from './components/Tooltip';

import { MainViewContent, MainViewFooter, MainViewHeader } from './MainView';

import MainViewToolbar from './MainViewToolbar';
import NoRunsView from './NoRunsView';
import RunCard, { RunCardSize } from './RunCard';
import RunFilterbar from './RunFilterbar';
import RunSortSelect from './RunSortSelect';

import { useOrderedRuns } from './runs';
import { assertFailed } from './utils';

import { ReactState } from './types';

type CardSizeSliderProps = {
  state: ReactState<RunCardSize>;
};

function CardSizeSlider({
  state: [cardSize, setCardSize]
}: CardSizeSliderProps) {
  const sizes: RunCardSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <Tooltip title="Card size">
      <Slider
        marks
        size="md"
        variant="plain"
        color="neutral"
        min={0}
        max={sizes.length - 1}
        value={sizes.indexOf(cardSize)}
        onChange={(e, val) => setCardSize(sizes[val as number])}
        sx={{
          width: 120,
          p: 0,
          '--Slider-railBackground': 'var(--joy-palette-neutral-plainHoverBg)',
          '--Slider-trackBackground': 'var(--joy-palette-neutral-plainHoverBg)',
          ':hover': { '--Slider-trackBackground': 'unset' }
        }}
      />
    </Tooltip>
  );
}

type ConfigProps = {
  cardSizeState: ReactState<RunCardSize>;
};

function Config({ cardSizeState }: ConfigProps) {
  return (
    <KeyDownBoundary navOnly>
      <Stack direction="row" flexWrap="wrap" gap={2} mr={1}>
        <Labeled label="Sort">
          <RunSortSelect />
        </Labeled>
        <Divider orientation="vertical" />
        <CardSizeSlider state={cardSizeState} />
      </Stack>
    </KeyDownBoundary>
  );
}

function cardGridLayout(cardSize: RunCardSize) {
  switch (cardSize) {
    case 'xs':
      return { xs: 6, sm: 4, md: 3, lg: 2, xl: 2 };
    case 'sm':
      return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
    case 'md':
      return { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 };
    case 'lg':
      return { xs: 12, sm: 12, md: 12, lg: 6, xl: 4 };
    case 'xl':
      return { xs: 12, sm: 12, md: 12, lg: 12, xl: 6 };
    default:
      assertFailed(cardSize);
  }
}

export default function GridView() {
  const runs = useOrderedRuns();

  const cardSizeState = React.useState<RunCardSize>('md');
  const [cardSize] = cardSizeState;

  const gridLayout = cardGridLayout(cardSize);

  const mainViewRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <MainViewHeader>
        <RunFilterbar />
      </MainViewHeader>
      <MainViewContent ref={mainViewRef}>
        {runs.length ? (
          <Grid container p={0.5}>
            {runs.map(run => (
              <Grid key={run.id} p={0.5} {...gridLayout}>
                <LazyLoad
                  root={mainViewRef}
                  sx={{ height: '100%' }}
                  children={lazy => (
                    <RunCard
                      lazy={lazy}
                      run={run}
                      sx={{ height: '100%' }}
                      size={cardSize}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoRunsView />
        )}
      </MainViewContent>
      <MainViewFooter>
        <MainViewToolbar
          endDecorator={<Config cardSizeState={cardSizeState} />}
        />
      </MainViewFooter>
    </>
  );
}
