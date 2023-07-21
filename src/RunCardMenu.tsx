import React from 'react';

import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/joy';
import { MoreVert } from '@mui/icons-material';
import { SxProps } from '@mui/joy/styles/types';

import KeyDownBoundary from './components/KeyDownBoundary';

import {
  useDeleteRun,
  useOperationFilter,
  usePurgeRun,
  useRestoreRun,
  useRunsSource,
  useStatusFilter
} from './runs';

import { Run } from './types';
import { ConfirmDialog, useConfirmDialog } from './components/ConfirmDialog';

type RunItemProps = {
  run: Run;
  close: () => void;
};

type ConfirmableRunItemProps = RunItemProps & {
  confirm: () => void;
};

function FilterLikeThisItem({ run, close }: RunItemProps) {
  const [statusFilter, setStatusFilter] = useStatusFilter();
  const [operationFilter, setOperationFilter] = useOperationFilter();

  const filterSet =
    statusFilter.includes(run.status) &&
    operationFilter.includes(run.operation);

  return (
    <MenuItem
      data-action="filter"
      sx={{ whiteSpace: 'nowrap' }}
      disabled={filterSet}
      onClick={() => {
        close();
        setStatusFilter([run.status]);
        setOperationFilter([run.operation]);
      }}
    >
      Filter runs like this
    </MenuItem>
  );
}

function DeleteItem({ run, close, confirm }: ConfirmableRunItemProps) {
  const [canDelete] = useDeleteRun(run);

  return (
    <MenuItem
      onClick={() => {
        close();
        confirm();
      }}
      disabled={!canDelete}
    >
      Delete
    </MenuItem>
  );
}

function RestoreItem({ run, close }: RunItemProps) {
  const [canRestore, restoreRun] = useRestoreRun(run);

  return (
    <MenuItem
      onClick={() => {
        close();
        restoreRun();
      }}
      disabled={!canRestore}
    >
      Restore
    </MenuItem>
  );
}

function PurgeItem({ run, close, confirm }: ConfirmableRunItemProps) {
  const [canPurge] = usePurgeRun(run);

  return (
    <MenuItem
      onClick={() => {
        close();
        if (confirm) {
          confirm();
        }
      }}
      disabled={!canPurge}
    >
      Permanently Delete
    </MenuItem>
  );
}

export type RunCardMenuSize = 'xs' | 'sm' | 'md';

type RunCardMenuProps = {
  run: Run;
  size?: RunCardMenuSize;
  sx?: SxProps;
};

function iconButtonSx(size: RunCardMenuSize | undefined) {
  switch (size) {
    case 'xs':
      return {
        '--IconButton-radius': '3px',
        '--IconButton-size': '18px'
      };
    case 'sm':
      return {
        '--IconButton-radius': '4px',
        '--IconButton-size': '22px'
      };
    default:
      return {
        '--IconButton-radius': '8px',
        '--IconButton-size': '28px'
      };
  }
}

export default function RunCardMenu({ run, size, sx }: RunCardMenuProps) {
  const buttonRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [source] = useRunsSource();

  const [, purgeRun] = usePurgeRun(run);
  const [confirmPurge, confirmPurgeState] = useConfirmDialog(purgeRun);

  const [, deleteRun] = useDeleteRun(run);
  const [confirmDelete, confirmDeleteState] = useConfirmDialog(deleteRun);

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <ConfirmDialog state={confirmPurgeState} acceptLabel="Permanently delete">
        You are about to permanently delete this run. This cannot be undone.
      </ConfirmDialog>

      <ConfirmDialog
        variant="info"
        state={confirmDeleteState}
        acceptLabel="Delete"
      >
        <Stack gap={1}>
          Delete this run?
          <Typography textColor="text.tertiary" fontSize="sm">
            <em>
              You can restore deleted runs under <strong>Deleted</strong> in the
              sidebar.
            </em>
          </Typography>
        </Stack>
      </ConfirmDialog>

      <Box sx={sx}>
        <KeyDownBoundary>
          <IconButton
            ref={buttonRef}
            variant="plain"
            color="neutral"
            onClick={e => {
              e.stopPropagation();
              setOpen(!open);
            }}
            sx={iconButtonSx(size)}
          >
            <MoreVert />
          </IconButton>
          <Menu
            size="sm"
            anchorEl={buttonRef.current}
            open={open}
            onClose={close}
            aria-labelledby="basic-demo-button"
          >
            <FilterLikeThisItem run={run} close={close} />
            <Divider />
            {['local'].includes(source.type) && (
              <DeleteItem run={run} close={close} confirm={confirmDelete} />
            )}
            {['local-deleted', 'local-archive'].includes(source.type) && (
              <RestoreItem run={run} close={close} />
            )}
            {['local-deleted', 'local-archive'].includes(source.type) && (
              <PurgeItem run={run} close={close} confirm={confirmPurge} />
            )}
          </Menu>
        </KeyDownBoundary>
      </Box>
    </>
  );
}
