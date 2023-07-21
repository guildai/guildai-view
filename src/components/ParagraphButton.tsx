import { Button } from '@mui/joy';
import React from 'react';

type ParagraphButtonProps = {
  onClick: React.MouseEventHandler;
  children: React.ReactNode;
};

export default function ParagraphButton({
  onClick,
  children
}: ParagraphButtonProps) {
  return (
    <Button
      size="sm"
      variant="outlined"
      color="neutral"
      onClick={onClick}
      sx={{ ml: 1, fontWeight: 'unset' }}
    >
      {children}
    </Button>
  );
}
