import React from 'react';

import { Tab, TabList, Tabs, tabClasses } from '@mui/joy';

import { SX_HSCROLL_THIN } from '../styles';

type ViewTabProps = {
  value: any;
  children: React.ReactNode;
};

export function ViewTab({ value, children }: ViewTabProps) {
  const tabSx = { flexGrow: 0, scrollMargin: '8px' };

  const disableTabShortcuts = {
    root: {
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') {
          e.stopPropagation();
        }
      }
    }
  };

  return (
    <Tab value={value} sx={tabSx} slotProps={disableTabShortcuts}>
      {children}
    </Tab>
  );
}

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

type ViewTabsProps = {
  value: any;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

export function ViewTabs({ value, onChange, children }: ViewTabsProps) {
  return (
    <Tabs
      selectionFollowsFocus
      value={value}
      onChange={(e, val) => onChange(val as string)}
      sx={{ backgroundColor: 'unset', flexGrow: 1, overflow: 'hidden' }}
    >
      {children}
    </Tabs>
  );
}
