import { Box, BoxProps, CircularProgress } from '@mui/joy';

import {
  CheckCircle,
  Error,
  Pending,
  Cancel,
  Help,
  ChangeCircle
} from '@mui/icons-material';

import { IconProps } from '@mui/material';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

type RunStatusIconProps = BoxProps & { status: string; size?: IconSize };

type Dim = { height: string; width: string };

export default function RunStatusIcon({
  status,
  size,
  sx,
  ...props
}: RunStatusIconProps) {
  const dim = iconDim(size);
  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'center',
        ...sx
      }}
    >
      {status === 'running' ? runningProgress(dim) : iconForStatus(status, dim)}
    </Box>
  );
}

function iconDim(size?: IconSize): Dim {
  const val = size ? `var(--joy-fontSize-${size})` : 'var(--joy-fontSize-md)';
  return { width: val, height: val };
}

function runningProgress({ height }: Dim) {
  const thickness = `calc(0.125 * ${height})`;
  return (
    <CircularProgress
      variant="soft"
      color="success"
      sx={{
        margin: '2px',
        '--CircularProgress-size': height,
        '--CircularProgress-progressThickness': thickness,
        '--CircularProgress-trackThickness': thickness
      }}
    />
  );
}

export function CompletedIcon({ sx }: IconProps) {
  return (
    <CheckCircle
      sx={{
        color: 'var(--joy-palette-success-solidBg)',
        ...sx
      }}
    />
  );
}

export function ErrorIcon({ sx }: IconProps) {
  return (
    <Error
      sx={{
        color: 'var(--joy-palette-danger-solidBg)',
        ...sx
      }}
    />
  );
}

export function TerminatedIcon({ sx }: IconProps) {
  return (
    <Cancel
      sx={{
        color: 'var(--joy-palette-neutral-solidBg)',
        ...sx
      }}
    />
  );
}

export function PendingIcon({ sx }: IconProps) {
  return (
    <Pending
      sx={{
        color: 'var(--joy-palette-neutral-solidBg)',
        ...sx
      }}
    />
  );
}

export function StaticRunningIcon({ sx }: IconProps) {
  return (
    <ChangeCircle
      sx={{
        color: 'var(--joy-palette-success-solidBg)',
        ...sx
      }}
    />
  );
}

export function UnknownIcon({ sx }: IconProps) {
  return (
    <Help
      sx={{
        color: 'var(--joy-palette-neutral-solidBg)',
        ...sx
      }}
    />
  );
}

function iconForStatus(status: string, { height, width }: Dim) {
  switch (status) {
    case 'completed':
      return <CompletedIcon sx={{ height, width }} />;
    case 'error':
      return <ErrorIcon sx={{ height, width }} />;
    case 'terminated':
      return <TerminatedIcon sx={{ height, width }} />;
    case 'staged':
    case 'pending':
      return <PendingIcon sx={{ height, width, opacity: 0.5 }} />;
    default:
      return <UnknownIcon sx={{ height, width }} />;
  }
}
