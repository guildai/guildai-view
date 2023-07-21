import React from 'react';

import {
  Box,
  Button,
  Divider,
  Modal,
  ModalDialog,
  Stack,
  Typography
} from '@mui/joy';

import { Info, Warning } from '@mui/icons-material';

type ConfirmDialogProps = {
  variant?: 'info' | 'warning';
  state: ConfirmDialogState;
  children: React.ReactNode;
  acceptLabel?: string;
};

export type ConfirmDialogState = {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  onAccept: () => void;
};

export function ConfirmDialog({
  state,
  children,
  variant,
  acceptLabel
}: ConfirmDialogProps) {
  return (
    <Modal open={state.open} onClose={() => state.setOpen(false)}>
      <ModalDialog size="sm" variant="soft">
        <Typography
          startDecorator={variant === 'info' ? <Info /> : <Warning />}
          sx={{ svg: { marginTop: '-1px' } }}
        >
          Confirm
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ p: 1 }}>{children}</Box>
        <Divider sx={{ mt: 2 }} />
        <Stack
          direction="row"
          spacing={1}
          pt={2}
          sx={{ justifyContent: 'center' }}
        >
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => state.setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="danger"
            onClick={() => {
              state.onAccept();
              state.setOpen(false);
            }}
          >
            {acceptLabel || 'OK'}
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export function useConfirmDialog(
  onAccept: () => void
): [() => void, ConfirmDialogState] {
  const [open, setOpen] = React.useState<boolean>(false);

  const openDialog = () => {
    setOpen(true);
  };

  return [openDialog, { open, setOpen, onAccept }];
}
