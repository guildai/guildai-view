import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { Link } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import React from 'react';

type ListSubheaderToggleProps = {
  children: React.ReactNode;
  open: boolean;
  onClick: React.MouseEventHandler;
  sx?: SxProps;
};

export default function ListSubheaderToggle({
  open,
  onClick,
  children,
  sx
}: ListSubheaderToggleProps) {
  return (
    <Link
      component="button"
      color="neutral"
      level="body3"
      underline="none"
      sx={{
        fontWeight: 'normal',
        textTransform: 'uppercase',
        pr: 0.5,
        pt: '1px', // pixel tweaking (Linux/Chrome)
        mt: 1,
        ':hover': { color: 'text.primary' },
        '& svg': {
          marginTop: '-1px' // pixel tweaking (Linux/Chrome)
        },
        ...sx
      }}
      startDecorator={open ? <ExpandMore /> : <ChevronRight />}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
