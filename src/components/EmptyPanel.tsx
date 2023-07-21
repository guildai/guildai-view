import React from 'react';

import { Typography } from '@mui/joy';

type EmptyViewProps = {
  children?: React.ReactNode;
};

export default function EmptyPanel({ children }: EmptyViewProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
      }}
    >
      <Typography m={2} textColor="text.tertiary" fontSize="sm">
        <em>{children}</em>
      </Typography>
    </div>
  );
}
