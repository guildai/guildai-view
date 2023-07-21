import React from 'react';

import { IconButton, Select as SelectBase, SelectOwnProps } from '@mui/joy';

import { Clear } from '@mui/icons-material';

import Tooltip from './Tooltip';

export { Option } from '@mui/joy';

export type SelectProps<TValue extends {}> = SelectOwnProps<TValue> & {
  clearable?: boolean;
  clearTooltip?: string;
};

export function Select<TValue extends {}>({
  value,
  onChange,
  clearable,
  clearTooltip,
  children,
  ...props
}: SelectProps<TValue>) {
  const action: SelectOwnProps<TValue>['action'] = React.useRef(null);

  return (
    <SelectBase
      size="sm"
      action={action}
      value={value}
      onChange={onChange}
      {...props}
      {...(clearable &&
        value && {
          endDecorator: (
            <Tooltip title={clearTooltip || 'Clear'}>
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onMouseDown={event => {
                  event.stopPropagation();
                }}
                sx={{ '--IconButton-size': '1.8em' }}
                onClick={() => {
                  if (onChange) {
                    onChange(null, null);
                  }
                  action.current?.focusVisible();
                }}
              >
                <Clear
                  sx={{ color: 'var(--joy-palette-neutral-softActiveBg)' }}
                />
              </IconButton>
            </Tooltip>
          ),
          indicator: null
        })}
    >
      {children}
    </SelectBase>
  );
}
