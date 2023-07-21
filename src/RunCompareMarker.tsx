import React from 'react';

import { Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

type RunCompareMarkerProps = {
  children: React.ReactNode;
  fontSize?: string;
  sx?: SxProps;
};

export default function RunCompareMarker({
  fontSize,
  sx,
  children
}: RunCompareMarkerProps) {
  return (
    <Typography
      fontSize={fontSize || 'xl4'}
      component="span"
      sx={{ opacity: 0.3, fontWeight: 600, lineHeight: 1, ...sx }}
    >
      {children}
    </Typography>
  );
}
