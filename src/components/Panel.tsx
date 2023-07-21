import React from 'react';

import { Box, IconButton, List, ListItem, ListSubheader } from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import {
  KeyboardArrowLeftRounded,
  KeyboardArrowDownRounded
} from '@mui/icons-material';

type PanelProps = {
  title: string;
  details?: string;
  headerStyle?: 'default' | 'plain';
  children: React.ReactNode;
  collapsed?: boolean;
  state?: boolean;
  onToggle?: () => void;
  sx?: SxProps;
};

export default function Panel({
  title,
  details,
  children,
  collapsed: initialCollapsed,
  state,
  onToggle,
  headerStyle,
  sx
}: PanelProps) {
  const [collapsed, setCollapsed] = React.useState(initialCollapsed || false);

  const expanded = state !== undefined ? state : !collapsed;

  return (
    <List
      size="sm"
      sx={{
        bgcolor: 'background.surface',
        p: 1,
        '--ListItem-radius': '4px',
        '--List-gap': '4px',
        ...sx
      }}
    >
      <ListItem nested>
        <ListSubheader
          variant="soft"
          onClick={() => {
            if (state !== undefined) {
              if (onToggle) {
                onToggle();
              }
            } else {
              setCollapsed(!collapsed);
            }
          }}
          sx={{
            borderRadius: '4px',
            cursor: 'pointer',
            overflowX: 'hidden',
            ...headerSx(headerStyle)
          }}
        >
          {title}
          <span
            style={{
              fontWeight: 'initial',
              marginLeft: '0.5em'
            }}
          >
            {details}
          </span>
          <IconButton
            size="sm"
            variant="plain"
            // onClick handled by header above
            sx={{ '--IconButton-size': '26px', ml: 'auto' }}
          >
            {iconForState(expanded)}
          </IconButton>
        </ListSubheader>
        <Box sx={{ display: expanded ? null : 'none' }}>{children}</Box>
      </ListItem>
    </List>
  );
}

function headerSx(headerStyle: string | undefined) {
  if (headerStyle === 'plain') {
    return {
      textTransform: 'unset',
      fontSize: 'unset',
      fontWeight: 'unset'
    };
  } else {
    return {};
  }
}

function iconForState(expanded: boolean) {
  return expanded ? <KeyboardArrowDownRounded /> : <KeyboardArrowLeftRounded />;
}
