import React from 'react';

import { Checkbox, List, ListItem, ListItemDecorator } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

import Tooltip, { TooltipPlacement } from './Tooltip';

type ListItemProps = {
  value: string;
  label?: string;
  tooltip?: string;
  icon?: React.ReactElement;
};

type ListItemSelected = ListItemProps & { itemSelected: boolean };

type ToggleListProps = {
  items: ListItemProps[];
  selected?: string[];
  tooltipPlacement?: TooltipPlacement;
  sx?: SxProps;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export default function ToggleList({
  items,
  selected,
  tooltipPlacement,
  onChange,
  sx,
  disabled
}: ToggleListProps) {
  return (
    <List
      orientation="horizontal"
      variant="plain"
      size="sm"
      sx={{
        flexGrow: 0,
        '--List-gap': 0,
        '--ListItem-paddingX': '0.5rem',
        '--ListItem-paddingY': '0.5rem',
        '--ListItem-minHeight': 0,
        ...sx
      }}
    >
      {itemsSelectedMap(items, selected || []).map(
        ({ value, label, tooltip, icon, itemSelected }) => (
          <Tooltip title={tooltip} placement={tooltipPlacement} key={value}>
            <ListItem>
              {icon && (
                <ListItemDecorator
                  sx={{
                    minInlineSize: !label || !icon ? 0 : null,
                    zIndex: 3,
                    pointerEvents: 'none',
                    opacity: itemSelected && !disabled ? 1 : 0.3,
                    color: itemSelected ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {icon}
                </ListItemDecorator>
              )}
              <Checkbox
                size="sm"
                value={value}
                disableIcon
                overlay
                label={label}
                checked={itemSelected}
                color="neutral"
                variant="plain"
                disabled={disabled}
                onChange={onChange}
                sx={{ '--Checkbox-actionRadius': 'var(--joy-radius-sm)' }}
              />
            </ListItem>
          </Tooltip>
        )
      )}
    </List>
  );
}

function itemsSelectedMap(
  items: ListItemProps[],
  selected: string[]
): ListItemSelected[] {
  return items.map(item => ({
    ...item,
    itemSelected: selected.includes(item.value)
  }));
}
