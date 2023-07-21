import React from 'react';

import { Box } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

type ConditionalProps = {
  active: boolean;
  children: React.ReactNode;
};

export default function Conditional({ active, children }: ConditionalProps) {
  return <div style={{ display: active ? undefined : 'none' }}>{children}</div>;
}

type Conditional2Props = {
  active: boolean;
  children: () => React.ReactNode;
  sx?: SxProps;
};

export function Conditional2({ active, sx, children }: Conditional2Props) {
  const [render, setRender] = React.useState<boolean>(false);

  React.useEffect(() => {
    setRender(render || active);
  }, [setRender, render, active]);

  return render ? (
    <Box sx={{ ...sx, ...(!active ? { display: 'none' } : {}) }}>
      {children()}
    </Box>
  ) : (
    <></>
  );
}
