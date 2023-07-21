import React from 'react';

import { Typography } from '@mui/joy';

type EmptyViewProps = {
  children?: React.ReactNode;
};

export default function EmptyView({ children }: EmptyViewProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--joy-palette-background-body)'
      }}
    >
      <Typography m={2} level="body2">
        <em>{children}</em>
      </Typography>
    </div>
  );
}
