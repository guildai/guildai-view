import React from 'react';

import { SxProps } from '@mui/joy/styles/types';

import { Sheet } from '@mui/joy';

type ClickableLabelProps = {
  onClick: React.MouseEventHandler;
  children?: React.ReactNode;
  sx?: SxProps;
  disabled?: boolean;
};

export default function ClickableLabel({
  sx,
  onClick,
  children,
  disabled
}: ClickableLabelProps) {
  const ref = React.useRef(null);

  return (
    <Sheet
      ref={ref}
      variant={disabled ? 'plain' : 'outlined'}
      sx={{
        padding: '0.25rem 0.4rem',
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: '2rem',
        gap: 1,
        cursor: 'default',
        borderRadius: 'var(--joy-radius-sm)',
        ':hover': {
          borderColor: disabled
            ? null
            : 'var(--joy-palette-neutral-outlinedHoverBorder)'
        },
        ...sx
      }}
      onClick={e => {
        if (!disabled) {
          onClick(e);
        }
      }}
    >
      {children}
    </Sheet>
  );
}
