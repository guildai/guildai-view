import React from 'react';

import {
  Card,
  CardContent,
  CardCover,
  Stack,
  Typography
} from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import Tooltip from './components/Tooltip';

import RunCardFeatures from './RunCardFeatures';
import RunCardMenu, { RunCardMenuSize } from './RunCardMenu';
import RunCompareMarker from './RunCompareMarker';
import RunOperationLabel from './RunOperationLabel';
import RunStatusIcon, { IconSize } from './RunStatusIcon';

import {
  useScrollIntoView,
  useKeySelectedClicked,
  useCompare,
  useCurrent
} from './selection';

import { runStatusLabel } from './runs';
import {
  ImageFeature,
  ScalarFeature,
  useFeaturedImages,
  useFeaturedScalars
} from './features';
import { useHover } from './highlight';
import { useMainView } from './mainView';

import {
  disableShiftSelect,
  formatRunDate,
  useRefreshListener
} from './utils';

import { Run } from './types';

export type RunCardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

function headerRowSizeProps(size: RunCardSize) {
  // mr provides space for card menu
  switch (size) {
    case 'xs':
      return { spacing: 0.4, mr: 1.5 };
    case 'sm':
      return { spacing: 0.5, mr: 1.75 };
    default:
      return { spacing: 0.6, mr: 2.25 };
  }
}

function headerIconSizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { size: 'xs' as IconSize };
    case 'sm':
      return { size: 'sm' as IconSize };
    default:
      return { size: 'md' as IconSize };
  }
}

function headerOpSizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { fontSize: 'xs' };
    case 'sm':
      return { fontSize: 'sm' };
    default:
      return { fontSize: 'md' };
  }
}

function headerDateSizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { fontSize: 'xs2' };
    case 'sm':
      return { fontSize: 'xs' };
    default:
      return { fontSize: 'sm' };
  }
}

function headerLabelSizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { fontSize: 'xs2' };
    case 'sm':
      return { fontSize: 'xs' };
    default:
      return { fontSize: 'sm' };
  }
}

function RunHeader({ run, size }: RunCardProps) {
  const started = formatRunDate(run.started);

  return (
    <Stack>
      <Stack direction="row" alignItems="center" {...headerRowSizeProps(size)}>
        <Tooltip title={runStatusLabel(run.status)} placement="top-start">
          <span>
            <RunStatusIcon status={run.status} {...headerIconSizeProps(size)} />
          </span>
        </Tooltip>
        <Tooltip title={run.operation} placement="top-start">
          <Typography noWrap {...headerOpSizeProps(size)}>
            <RunOperationLabel run={run} />
          </Typography>
        </Tooltip>
      </Stack>
      {/* Wrap with row stack to limit tooltip to label */}
      <Stack direction="row">
        <Tooltip title={started} placement="top-start">
          <Typography
            noWrap
            textColor="text.tertiary"
            {...headerDateSizeProps(size)}
          >
            {started}
          </Typography>
        </Tooltip>
      </Stack>
      {/* Wrap with row stack to limit tooltip to label */}
      <Stack direction="row">
        <Tooltip title={run.label} placement="top-start">
          <Typography
            noWrap
            textColor="text.secondary"
            {...headerLabelSizeProps(size)}
          >
            {run.label}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

type RunCardProps = {
  run: Run;
  size: RunCardSize;
  sx?: SxProps;
  lazy?: boolean;
};

function cardMenuSizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return {
        size: 'xs' as RunCardMenuSize,
        sx: { position: 'absolute', right: 0, top: 0 }
      };
    case 'sm':
      return {
        size: 'sm' as RunCardMenuSize,
        sx: { position: 'absolute', right: 0, top: '0.25rem' }
      };
    default:
      return {
        size: 'md' as RunCardMenuSize,
        sx: { position: 'absolute', right: 0, top: 0 }
      };
  }
}

function RunFeaturesSm({ run }: { run: Run }) {
  const [scalars, refreshScalars] = useFeaturedScalars(run);

  useRefreshListener(refreshScalars);

  const featuredScalars = scalars.slice(0, 1);

  return <RunCardFeatures scalars={featuredScalars} />;
}

function RunFeaturesMd({ run }: { run: Run }) {
  const [images, refreshImages] = useFeaturedImages(run);
  const [scalars, refreshScalars] = useFeaturedScalars(run);

  useRefreshListener(refreshScalars);
  useRefreshListener(refreshImages);

  const [featuredImages, featuredScalars, scalarCols]: [
    ImageFeature[],
    ScalarFeature[],
    number | undefined
  ] =
    images.length > 0
      ? scalars.length > 0
        ? [images.slice(0, 1), scalars.slice(0, 3), undefined]
        : [images.slice(0, 2), [], undefined]
      : [[], scalars.slice(0, 6), 2];

  return (
    <RunCardFeatures
      images={featuredImages}
      scalars={featuredScalars}
      scalarCols={scalarCols}
    />
  );
}

function RunFeaturesLg({ run }: { run: Run }) {
  const [scalars, refreshScalars] = useFeaturedScalars(run);
  const [images, refreshImages] = useFeaturedImages(run);

  useRefreshListener(refreshScalars);
  useRefreshListener(refreshImages);

  const [featuredImages, featuredScalars, scalarCols]: [
    ImageFeature[],
    ScalarFeature[],
    number | undefined
  ] =
    images.length > 0
      ? scalars.length > 0
        ? [images.slice(0, 1), scalars.slice(0, 3), undefined]
        : [images.slice(0, 2), [], undefined]
      : [[], scalars.slice(0, 18), 3];

  return (
    <RunCardFeatures
      images={featuredImages}
      scalars={featuredScalars}
      scalarCols={scalarCols}
    />
  );
}

function RunFeaturesXl({ run }: { run: Run }) {
  const [scalars, refreshScalars] = useFeaturedScalars(run);
  const [images, refreshImages] = useFeaturedImages(run);

  useRefreshListener(refreshScalars);
  useRefreshListener(refreshImages);

  const [featuredImages, featuredScalars, scalarCols]: [
    ImageFeature[],
    ScalarFeature[],
    number | undefined
  ] =
    images.length > 0
      ? scalars.length > 0
        ? [images.slice(0, 1), scalars.slice(0, 3), undefined]
        : [images.slice(0, 2), [], undefined]
      : [[], scalars.slice(0, 48), 4];

  return (
    <RunCardFeatures
      images={featuredImages}
      scalars={featuredScalars}
      scalarCols={scalarCols}
    />
  );
}

function RunFeatures({ run, size }: RunCardProps) {
  return size === 'sm' ? (
    <RunFeaturesSm run={run} />
  ) : size === 'md' ? (
    <RunFeaturesMd run={run} />
  ) : size === 'lg' ? (
    <RunFeaturesLg run={run} />
  ) : size === 'xl' ? (
    <RunFeaturesXl run={run} />
  ) : (
    <></>
  );
}

function cardOverlaySizeProps(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { fontSize: 'xl4' };
    case 'sm':
      return { fontSize: 'xl5' };
    case 'md':
      return { fontSize: 'xl6' };
    default:
      return { fontSize: 'xl7' };
  }
}

function CardOverlay({ run, size }: RunCardProps) {
  const current = useCurrent();
  const [compareMode, compare] = useCompare();

  const overlay = current === run.id ? 'A' : compare === run.id ? 'B' : null;

  return compareMode && overlay ? (
    <CardCover>
      <RunCompareMarker
        {...cardOverlaySizeProps(size)}
        sx={{
          width: '100%',
          height: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {overlay}
      </RunCompareMarker>
    </CardCover>
  ) : (
    <></>
  );
}

function cardSizeSx(size: RunCardSize) {
  switch (size) {
    case 'xs':
      return { '--Card-padding': '0.4rem', py: '0.2rem' };
    case 'sm':
      return { '--Card-padding': '0.5rem', py: '0.25rem' };
    default:
      return { '--Card-padding': '0.6rem', py: '0.3rem' };
  }
}

function cardStyleSx(state: CardState) {
  const outlineColor = state.hover
    ? 'var(--joy-palette-info-300)'
    : state.current
    ? 'var(--joy-palette-neutral-300)'
    : 'unset';

  const outlineWidth = state.hover ? '1px' : 'unset';

  const bgcolor = state.current
    ? 'var(--joy-palette-background-level3)'
    : state.selected
    ? 'var(--joy-palette-background-level2)'
    : 'unset';

  return {
    outline: `${outlineWidth} solid ${outlineColor}`,
    bgcolor
  };
}

function cardEventHandlerProps(state: CardState) {
  return {
    onMouseEnter: state.setHover,
    onMouseLeave: state.clearHover,
    onMouseDown: disableShiftSelect,
    onClick: (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).role) {
        // Card components the user can interact with must have a 'role'
        // attribute, which implies that click events do not trigger a card
        // select/deselect.
        state.handleClick(e);
      }
    },
    onDoubleClick: (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).role) {
        state.handleDoubleClick(e);
      }
    }
  };
}

type CardState = {
  hover: boolean;
  selected: boolean;
  current: boolean;
  setHover: () => void;
  clearHover: () => void;
  handleClick: React.MouseEventHandler;
  handleDoubleClick: React.MouseEventHandler;
};

function useCardState(run: Run): CardState {
  const [hover, setHover] = useHover();
  const [selected, current, handleClick] = useKeySelectedClicked(run.id);
  const [, setView] = useMainView();

  return {
    hover: hover === run.id,
    selected,
    current,
    setHover: () => {
      setHover(run.id);
    },
    clearHover: () => {
      setHover(null);
    },
    handleClick,
    handleDoubleClick: () => {
      setView('run');
    }
  };
}

export default function RunCard({ run, size, sx, lazy }: RunCardProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  const state = useCardState(run);

  useScrollIntoView(run.id, ref);

  return (
    <Card
      ref={ref}
      variant="outlined"
      slotProps={{
        root: { style: { gap: 0 } }
      }}
      sx={{
        '--Card-radius': '8px',
        cursor: 'pointer',
        scrollMargin: '3rem', // for scroll-into-view
        ...cardSizeSx(size),
        ...cardStyleSx(state),
        ...sx
      }}
      {...cardEventHandlerProps(state)}
    >
      <CardOverlay run={run} size={size} />
      <RunCardMenu run={run} {...cardMenuSizeProps(size)} />
      <RunHeader run={run} size={size} />
      <CardContent />
      {(lazy === undefined || lazy) && <RunFeatures run={run} size={size} />}
    </Card>
  );
}
