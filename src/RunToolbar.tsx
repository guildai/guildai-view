import {
  DeleteOutlined,
  DeleteForeverOutlined,
  RestoreOutlined
} from '@mui/icons-material';

import { ConfirmDialog, useConfirmDialog } from './components/ConfirmDialog';
import Labeled from './components/Labeled';
import Toolbar from './components/Toolbar';
import ToolbarButton from './components/ToolbarButton';

import {
  useDeleteSelectedRuns,
  usePurgeSelectedRuns,
  useRunsSource,
  useRestoreSelectedRuns
} from './runs';

import { isKey, useKeyDownListener } from './utils';
import { Stack, Typography } from '@mui/joy';

function DeleteButton() {
  const [canDelete, deleteRuns, runs] = useDeleteSelectedRuns();

  const [confirmDelete, confirmState] = useConfirmDialog(() => {
    deleteRuns();
  });

  useKeyDownListener([[e => isKey(e, { key: 'Delete' }), confirmDelete]]);

  return (
    <>
      <ConfirmDialog variant="info" state={confirmState} acceptLabel="Delete">
        <Stack gap={1}>
          Delete selected {runs.length === 1 ? 'run' : 'runs'}?
          <Typography textColor="text.tertiary" fontSize="sm">
            <em>
              You can restore deleted runs under <strong>Deleted</strong> in the
              sidebar.
            </em>
          </Typography>
        </Stack>
      </ConfirmDialog>

      <ToolbarButton
        tooltip={runs.length === 1 ? 'Delete Run' : 'Delete Selected Runs'}
        onClick={() => {
          confirmDelete();
        }}
        disabled={!canDelete}
        icon={<DeleteOutlined />}
      />
    </>
  );
}

function PurgeButton() {
  const [canPurge, purgeRuns, runs] = usePurgeSelectedRuns();

  const [confirmPurge, confirmState] = useConfirmDialog(() => {
    purgeRuns();
  });

  useKeyDownListener([[e => isKey(e, { key: 'Delete' }), confirmPurge]]);

  return (
    <>
      <ConfirmDialog state={confirmState} acceptLabel="Permanently Delete">
        You are about to permanently delete {runs.length}{' '}
        {runs.length === 1 ? 'run' : 'runs'}. This cannot be undone.
      </ConfirmDialog>

      <ToolbarButton
        tooltip={
          runs.length === 1
            ? 'Permanently Delete Run'
            : 'Permanently Delete Selected Runs'
        }
        onClick={() => {
          confirmPurge();
        }}
        disabled={!canPurge}
        icon={<DeleteForeverOutlined />}
      />
    </>
  );
}

function RestoreButton() {
  const [canRestore, restoreRuns, runs] = useRestoreSelectedRuns();

  return (
    <ToolbarButton
      tooltip={runs.length === 1 ? 'Restore Run' : 'Restore Selected Runs'}
      onClick={() => {
        restoreRuns();
      }}
      disabled={!canRestore}
      icon={<RestoreOutlined />}
    />
  );
}

export default function RunToolbar() {
  const [source] = useRunsSource();

  return (
    <Labeled
      label="Actions"
      tooltip="Perform run actions"
      sx={{ mx: 2, mt: 0.5, mb: 0.25 }}
    >
      <Toolbar>
        {['local', 'local-archive'].includes(source.type) && <DeleteButton />}
        {['local-deleted'].includes(source.type) && <RestoreButton />}
        {['local-deleted'].includes(source.type) && <PurgeButton />}
      </Toolbar>
    </Labeled>
  );
}
