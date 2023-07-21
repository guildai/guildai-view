import React from 'react';

import { Textarea, Typography } from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import ClickableLabel from './ClickableLabel';
import KeyDownBoundary from './KeyDownBoundary';
import Tooltip from './Tooltip';

import { assert } from '../utils';

type ValueInputProps = {
  value: string;
  onChange?: (arg0: string) => void;
  sx?: SxProps;
  disabled?: boolean;
};

function editorTextArea(el: HTMLElement): HTMLTextAreaElement {
  const input = el.getElementsByTagName('textarea')[0];
  assert(input);
  return input;
}

export default function ValueInput({
  value,
  onChange,
  sx,
  disabled
}: ValueInputProps) {
  const [editing, setEditing] = React.useState<boolean>(false);
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    if (editorRef.current) {
      editorTextArea(editorRef.current).value = value;
    }
  });

  React.useEffect(() => {
    if (editing && editorRef.current) {
      editorTextArea(editorRef.current).focus();
    }
  }, [editing]);

  return editing ? (
    <KeyDownBoundary>
      <Textarea
        ref={editorRef}
        size="sm"
        sx={{
          color: 'var(--joy-palette-text-secondary)',
          padding: '0.4rem',
          '--Input-radius': '4px',
          '--Input-minHeight': 'unset',
          maxHeight: '4rem',
          ...sx
        }}
        onFocus={e => {
          setEditing(true);
        }}
        onBlur={e => {
          setEditing(false);
          if (onChange) {
            const inputVal = (e.target as HTMLTextAreaElement).value;
            if (inputVal !== value) {
              onChange(inputVal);
            }
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            (e.target as HTMLElement).blur();
          } else if (e.key === 'Escape') {
            (e.target as HTMLInputElement).value = value;
            (e.target as HTMLElement).blur();
          }
        }}
      />
    </KeyDownBoundary>
  ) : (
    <ClickableLabel
      onClick={() => {
        setEditing(true);
      }}
      sx={sx}
      disabled={disabled}
    >
      <Tooltip title={value} placement="top-start">
        <Typography noWrap level="body2">
          {value}
        </Typography>
      </Tooltip>
    </ClickableLabel>
  );
}
