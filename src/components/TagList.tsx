import React from 'react';

import { Box, Chip, Stack, Textarea, Typography } from '@mui/joy';

import ClickableLabel from './ClickableLabel';
import KeyDownBoundary from './KeyDownBoundary';
import { removeDuplicates } from '../utils';
import { SxProps } from '@mui/joy/styles/types';

function encodeTags(tags: string[]): string {
  return tags.join(', ');
}

function decodeTags(s: string): string[] {
  return removeDuplicates(
    s
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length)
  );
}

type EditorProps = {
  tags: string[];
  setEditing: (arg0: boolean) => void;
  setTags: (arg0: string[]) => void;
};

function Editor({ tags, setEditing, setTags }: EditorProps) {
  const ref = React.useRef(null);

  const encodedTags = encodeTags(tags);

  React.useEffect(() => {
    if (ref.current) {
      const textarea = (ref.current as HTMLElement).getElementsByTagName(
        'textarea'
      )[0];
      textarea.value = encodedTags;
      textarea.focus();
    }
  });

  return (
    <Stack>
      <KeyDownBoundary>
        <Textarea
          ref={ref}
          size="sm"
          sx={{ minHeight: '2rem' }}
          onBlur={e => {
            setEditing(false);
            const inputVal = (e.target as HTMLTextAreaElement).value;
            if (inputVal !== encodedTags) {
              setTags(decodeTags(inputVal));
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              (e.target as HTMLElement).blur();
            } else if (e.key === 'Escape') {
              (e.target as HTMLTextAreaElement).value = encodedTags;
              (e.target as HTMLElement).blur();
            }
          }}
        />
      </KeyDownBoundary>
      <Typography
        fontSize="xs"
        color="neutral"
        noWrap={false}
        sx={{ m: 0.5, mt: 0.75 }}
      >
        <em>
          Type a list of tags separated by commas. Press Enter to apply or Esc
          to cancel.
        </em>
      </Typography>
    </Stack>
  );
}

type TagProps = {
  label: string;
  onClick?: React.MouseEventHandler;
};

function Tag({ label, onClick }: TagProps) {
  return (
    <Chip
      size="sm"
      color="neutral"
      variant="soft"
      sx={{ '--Chip-radius': '6px', cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      {label}
    </Chip>
  );
}

type ListProps = {
  tags: string[];
  setEditing: (arg0: boolean) => void;
  editable?: boolean;
  onTagClick?: (arg0: string) => void;
};

function List({ tags, editable, setEditing, onTagClick }: ListProps) {
  return (
    <ClickableLabel
      onClick={e => {
        if (editable && (e.target as HTMLElement).tagName === 'DIV') {
          setEditing(true);
        }
      }}
      disabled={!editable}
    >
      {tags.map((tag, i) => (
        <Tag
          key={`${tag}-${i}`}
          label={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
    </ClickableLabel>
  );
}

type TagListProps = {
  tags: string[];
  editable?: boolean;
  onTagClick?: (arg0: string) => void;
  onTagsEdit?: (arg0: string[]) => void;
  sx?: SxProps;
};

export default function TagList({
  tags,
  editable,
  onTagClick,
  onTagsEdit,
  sx
}: TagListProps) {
  const [editing, setEditing] = React.useState<boolean>(false);

  const c = editing ? (
    <Editor
      tags={tags}
      setEditing={setEditing}
      setTags={tags => {
        if (onTagsEdit) {
          onTagsEdit(tags);
        }
      }}
    />
  ) : (
    <List
      tags={tags}
      editable={editable}
      setEditing={setEditing}
      onTagClick={onTagClick}
    />
  );
  return sx ? <Box sx={sx}>{c}</Box> : c;
}
