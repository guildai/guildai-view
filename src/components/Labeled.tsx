import React from 'react';

import { Stack, Typography } from '@mui/joy';

import { ResponsiveStyleValue } from '@mui/system';
import { SxProps } from '@mui/joy/styles/types';

import Tooltip, { TooltipPlacement } from './Tooltip';

type LabelProps = {
  label: string;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  gap?: ResponsiveStyleValue<number | string>;
  disabled?: boolean;
  children: React.ReactNode;
  sx?: SxProps;
};

export default function Labeled({
  label,
  tooltip,
  tooltipPlacement,
  gap,
  disabled,
  children,
  sx
}: LabelProps) {
  const labelComponent = (
    <Typography
      level="body2"
      sx={{
        cursor: 'default',
        color: 'text.tertiary',
        opacity: disabled ? 0.3 : 1.0
      }}
    >
      {label}
    </Typography>
  );
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={gap !== undefined ? gap : 1}
      sx={sx}
      flexWrap="wrap"
    >
      {tooltip ? (
        <Tooltip title={tooltip} placement={tooltipPlacement}>
          {labelComponent}
        </Tooltip>
      ) : (
        labelComponent
      )}
      {children}
    </Stack>
  );
}
