import React from 'react';

import { Box, Radio, RadioGroup, radioClasses } from '@mui/joy';

import Tooltip from './Tooltip';

type ButtonProps = {
  value: string;
  tooltip: string;
  icon: React.ReactElement;
};

type ToggleButtonGroupProps = {
  buttons: ButtonProps[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return (
    <div style={{ display: 'flex' }}>
      <RadioGroup
        orientation="horizontal"
        variant="outlined"
        value={props.value}
        overlay
        onChange={e => (props.onChange ? props.onChange(e) : null)}
        sx={{ flexWrap: 'wrap' }}
      >
        {props.buttons.map(({ value, tooltip, icon }) => (
          <Box
            key={value}
            sx={theme => ({
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 48,
              height: 32,
              '&:not([data-first-child])': {
                borderLeft: '1px solid',
                borderColor: 'divider'
              },
              [`&[data-first-child] .${radioClasses.action}`]: {
                borderTopLeftRadius: `calc(${theme.vars.radius} - 1px)`,
                borderBottomLeftRadius: `calc(${theme.vars.radius.sm} - 1px)`
              },
              [`&[data-last-child] .${radioClasses.action}`]: {
                borderTopRightRadius: `calc(${theme.vars.radius.sm} - 1px)`,
                borderBottomRightRadius: `calc(${theme.vars.radius.sm} - 1px)`
              }
            })}
          >
            <Tooltip title={tooltip}>
              <Radio
                value={value}
                disableIcon
                label={icon}
                variant={props.value === value ? 'soft' : 'plain'}
                slotProps={{
                  input: { 'aria-label': value },
                  action: {
                    sx: { borderRadius: 0, transition: 'none' }
                  },
                  label: { sx: { lineHeight: 0 } }
                }}
              />
            </Tooltip>
          </Box>
        ))}
      </RadioGroup>
    </div>
  );
}
