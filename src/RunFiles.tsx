import React from 'react';

import { Box, IconButton, Stack, Table, Typography } from '@mui/joy';

import {
  Folder,
  Image,
  InsertDriveFile,
  Description,
  NavigateNext,
  ExpandMore
} from '@mui/icons-material';

import { filesize } from 'filesize';
import { parse as parsePath } from 'path-browserify';

import Tooltip from './components/Tooltip';

import RunFileTypeFilter, { FileType } from './RunFileTypeFilter';

import { useRunFiles } from './runs';
import { assert, formatFileDate, useRefreshListener } from './utils';
import { RunFileTab, useRunTabs } from './runTabs';

import { Run, RunFile } from './types';

const iconSx = { color: 'var(--joy-palette-neutral-500)' };

function ExpandCollapseIcon({ expanded }: { expanded?: boolean }) {
  return expanded ? <ExpandMore sx={iconSx} /> : <NavigateNext sx={iconSx} />;
}

type ExpandCollapseToggleProps = {
  file: TableFile;
  expanded?: boolean;
  onClick?: React.MouseEventHandler;
};

function ExpandCollapseToggle({
  file,
  expanded,
  onClick
}: ExpandCollapseToggleProps) {
  return expandable(file) ? (
    <IconButton
      variant="plain"
      size="sm"
      sx={{
        '--IconButton-size': '20px',
        '--Icon-fontSize': '18px',
        '--IconButton-radius': '4px'
      }}
      onClick={onClick}
    >
      <ExpandCollapseIcon expanded={expanded} />
    </IconButton>
  ) : (
    <div style={{ width: '20px' }}></div>
  );
}

function expandable(file: RunFile): boolean {
  return file.isDir && !file.isLink;
}

type FileTypeIconProps = {
  file: TableFile;
};

function FileTypeIcon({ file }: FileTypeIconProps) {
  const sx = { color: 'var(--joy-palette-neutral-500)' };

  const icon = file.isText ? (
    <Description sx={sx} />
  ) : file.isDir ? (
    <Folder sx={sx} />
  ) : isImage(file.name) ? (
    <Image sx={sx} />
  ) : (
    <InsertDriveFile sx={sx} />
  );
  return icon;
}

function isImage(name: string): boolean {
  const p = parsePath(name);
  const imgExt = ['.png', '.jpg', '.jpeg', 'gif', '.bmp', '.svg'];
  return imgExt.includes(p.ext.toLowerCase());
}

export type RunClickHandler = (
  event: React.SyntheticEvent,
  path: string
) => void;

type FileRowProps = {
  file: TableFile;
  expanded?: boolean;
  onToggleExpand?: React.MouseEventHandler;
  onRunClick?: RunClickHandler;
};

function FileRow({ file, expanded, onToggleExpand, onRunClick }: FileRowProps) {
  const indentPadding = `${file.indent * 24}px`;
  return (
    <tr
      style={{
        cursor: 'pointer'
      }}
      onClick={e => {
        if (file.isFile && onRunClick) {
          onRunClick(e, file.path);
        } else if (expandable(file) && onToggleExpand) {
          onToggleExpand(e);
        }
      }}
    >
      <td>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{ marginLeft: indentPadding }}
        >
          <ExpandCollapseToggle
            file={file}
            expanded={expanded}
            // onClick handled by `tr` above
          />
          <FileTypeIcon file={file} />
          <Tooltip title={file.name}>
          <Typography noWrap>{file.name}</Typography>
          </Tooltip>
        </Stack>
      </td>
      <td>
        <Typography noWrap>{formatFileSize(file)}</Typography>
      </td>
      <td>
        <Typography noWrap>{fileTypeDesc(file)}</Typography>
      </td>
      <td>
        <Typography noWrap>{formatFileDate(file.mtime)}</Typography>
      </td>
    </tr>
  );
}

function formatFileSize(file: RunFile): string {
  if (file.isDir) {
    return formatDirSize(file);
  }
  return filesize(file.size, { round: 1 }) as string;
}

function formatDirSize(file: RunFile) {
  const fileCount = file.files ? file.files.length : 0;
  return fileCount === 1 ? '1 item' : `${fileCount} items`;
}

function fileTypeDesc(file: RunFile) {
  if (file.mType === 's') {
    return 'Source Code File';
  } else if (file.mType === 'g') {
    return 'Generated File';
  }
  return maybeLinkToDesc(file, maybeRequiredDesc(file, baseFileType(file)));
}

function baseFileType(file: RunFile) {
  return file.isDir ? 'Folder' : 'File';
}

function maybeRequiredDesc(file: RunFile, baseDesc: string) {
  return file.mType === 'd' ? `Required ${baseDesc}` : baseDesc;
}

function maybeLinkToDesc(file: RunFile, baseDesc: string) {
  return file.isLink ? `Link to ${baseDesc}` : baseDesc;
}

type TableFile = RunFile & { path: string; indent: number };

type TableState = {
  sortCol: string;
  sortRev: boolean;
  expanded: Set<string>;
  showHidden: boolean;
};

type FilesTableProps = {
  run: Run;
  fileTypes: FileType[];
  onRunClick?: RunClickHandler;
};

function FilesTable({ run, fileTypes, onRunClick }: FilesTableProps) {
  const [nestedFiles, refresh] = useRunFiles(run);

  const [state, setState] = React.useState<TableState>({
    sortCol: 'name',
    sortRev: false,
    expanded: new Set(),
    showHidden: false
  });

  useRefreshListener(refresh);

  const files = filterFiles(tableFiles(nestedFiles || [], state), fileTypes);

  return (
    <Table hoverRow stickyHeader>
      <thead>
        <tr>
          <th style={{ width: '40%' }}>Name</th>
          <th>Size</th>
          <th>Type</th>
          <th>Modified</th>
        </tr>
      </thead>
      <tbody>
        {files.map(file => (
          <FileRow
            key={file.path}
            file={file}
            expanded={state.expanded.has(file.path)}
            onToggleExpand={() => {
              setState(toggleExpanded(file, state));
            }}
            onRunClick={onRunClick}
          />
        ))}
      </tbody>
    </Table>
  );
}

function filterFiles(files: TableFile[], types: FileType[]): TableFile[] {
  if (!types.length) {
    return files;
  }
  return files.filter(f => f.mType && types.includes(f.mType as FileType));
}

function tableFiles(nested: RunFile[], state: TableState): TableFile[] {
  const files: TableFile[] = [];
  applyFlattened(nested, '', 0, state, files);
  return files;
}

function applyFlattened(
  nested: RunFile[],
  basePath: string,
  indent: number,
  state: TableState,
  files: TableFile[]
) {
  const sorted = nested.filter(filterFilesFn(state)).sort(cmpFilesFn(state));
  sorted.forEach(file => {
    files.push({ indent: indent, ...file });
    if (file.files && state.expanded.has(file.path)) {
      applyFlattened(file.files, file.path, indent + 1, state, files);
    }
  });
}

function filterFilesFn(state: TableState): (file: RunFile) => boolean {
  return file => state.showHidden || file.name[0] !== '.';
}

function cmpFilesFn(state: TableState): (a: RunFile, b: RunFile) => number {
  assert(state.sortCol === 'name' && !state.sortRev, state);
  return (a: RunFile, b: RunFile) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  };
}

function toggleExpanded(file: TableFile, state: TableState): TableState {
  if (!state.expanded.delete(file.path)) {
    state.expanded.add(file.path);
  }
  return { ...state, expanded: state.expanded };
}

type RunFilesProps = {
  run: Run;
};

export default function RunFiles({ run }: RunFilesProps) {
  const [, , , , openTab] = useRunTabs(run);

  const [fileTypeFilter, setFileTypeFilter] = React.useState<FileType[]>([]);

  const handleRunClick: RunClickHandler = (e, path) => {
    openTab(RunFileTab(path));
  };

  return (
    <Stack>
      <Box
        sx={{
          bgcolor: 'background.body',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 1
        }}
      >
        <Stack direction="row">
          <RunFileTypeFilter
            selected={fileTypeFilter}
            setSelected={setFileTypeFilter}
          />
        </Stack>
      </Box>
      <Box sx={{ overflowY: 'auto' }}>
        <FilesTable
          run={run}
          fileTypes={fileTypeFilter}
          onRunClick={handleRunClick}
        />
      </Box>
    </Stack>
  );
}
