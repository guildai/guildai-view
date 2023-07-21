import React from 'react';

import { TabList, tabClasses } from '@mui/joy';

import { SX_HSCROLL_THIN } from '../styles';

type ViewTabListProps = {
  children?: React.ReactNode;
};

export function ViewTabList({ children }: ViewTabListProps) {
  return (
    <TabList
      variant="plain"
      size="sm"
      sx={{
        p: 1,
        overflowX: 'auto',
        maxWidth: '100%',
        ...SX_HSCROLL_THIN,
        '--Tabs-gap': '0.25em',
        '--ListItem-radius': '6px',
        [`& .${tabClasses.root}`]: {
          px: 1.5,
          [`&.${tabClasses.selected}`]: {
            color: 'neutral.plainColor',
            bgcolor: 'neutral.plainActiveBg',
            boxShadow: 'none'
          }
        }
      }}
    >
      {children}
    </TabList>
  );
}
