import { Stack } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

import KeyDownBoundary from './KeyDownBoundary';

export function ToolbarSpacer() {
  return <div style={{ flex: 1 }} />;
}

type ToolbarProps = {
  children?: React.ReactNode;
  spacing?: number;
  sx?: SxProps;
};

export default function Toolbar({ children, spacing, sx }: ToolbarProps) {
  return (
    <KeyDownBoundary navOnly>
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        sx={sx}
        spacing={spacing}
      >
        {children}
      </Stack>
    </KeyDownBoundary>
  );
}
