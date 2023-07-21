import React from 'react';

import {
  Button,
  Divider,
  ListItemDecorator,
  Menu,
  MenuItem as MenuItemBase,
  Typography
} from '@mui/joy';

import { Check } from '@mui/icons-material';

import { usePrimarySidebarVisible, useRunStripVisible } from './app';
import { useSelectionActionState } from './selection';
import { useMainView } from './mainView';
import {
  useCurrentRun,
  useDeleteSelectedRuns,
  useRunsSource,
  usePurgeSelectedRuns,
  useRestoreSelectedRuns
} from './runs';

import { useCurrentRunTab } from './runTabs';

import { dispatchKeyDownEvent } from './utils';

import { ReactState, Run } from './types';

type MenuItemProps = {
  title: string;
  keyBind?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  selected?: boolean;
};

function MenuItem({
  title,
  keyBind,
  onClick,
  disabled,
  selected
}: MenuItemProps) {
  return (
    <MenuItemBase onClick={onClick} disabled={disabled} sx={{ pr: 2 }}>
      <ListItemDecorator>{selected && <Check />}</ListItemDecorator>
      {title}
      {keyBind && (
        <Typography
          level="body2"
          textColor={disabled ? 'neutral.plainDisabledColor' : 'text.tertiary'}
          ml="auto"
          pl={4}
        >
          {keyBind}
        </Typography>
      )}
    </MenuItemBase>
  );
}

type MenuPopupProps = {
  title: string;
  children: React.ReactNode;
  controller: MenuPopupController;
};

type MenuPopupController = {
  close: () => void;
  state: ReactState<boolean>;
};

function MenuPopup({ title, children, controller }: MenuPopupProps) {
  const [open, setOpen] = controller.state;
  const buttonRef = React.useRef(null);

  return (
    <div>
      <Button
        ref={buttonRef}
        size="sm"
        variant="plain"
        color="neutral"
        sx={{ fontWeight: 'unset' }}
        onClick={() => setOpen(!open)}
      >
        {title}
      </Button>
      <Menu
        anchorEl={buttonRef.current}
        placement="bottom-start"
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        sx={{ '--ListItemDecorator-size': '1.85em' }}
      >
        {children}
      </Menu>
    </div>
  );
}

function useMenuPopupController(): MenuPopupController {
  const [open, setOpen] = React.useState(false);
  const close = () => {
    setOpen(false);
  };
  return {
    close,
    state: [open, setOpen]
  };
}

function SelectionMenu() {
  const selection = useSelectionActionState();

  const popup = useMenuPopupController();

  return (
    <MenuPopup title="Selection" controller={popup}>
      <MenuItem
        title="Select All"
        keyBind="Ctrl+A"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('a', { ctrlKey: true });
        }}
        disabled={!selection.canSelect}
      />
      <MenuItem
        title="Deselect All"
        keyBind="Ctrl+D"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('d', { ctrlKey: true });
        }}
        disabled={!selection.canDeselect}
      />
      <MenuItem
        title="Select Only Current"
        keyBind="Ctrl+Shift+D"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('D', { shiftKey: true, ctrlKey: true });
        }}
        disabled={!selection.canSelectOnlyCurrent}
      />
      <Divider />
      <MenuItem
        title={`${
          selection.extendOrShrinkRight === 'extend' ? 'Expand' : 'Shrink'
        } Selection Right`}
        keyBind="Shift+RightArrow"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('ArrowRight', { shiftKey: true });
        }}
        disabled={!selection.canExtendRight}
      />
      <MenuItem
        title={`${
          selection.extendOrShrinkLeft === 'extend' ? 'Expand' : 'Shrink'
        } Selection Left`}
        keyBind="Shift+LeftArrow"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('ArrowLeft', { shiftKey: true });
        }}
        disabled={!selection.canExtendLeft}
      />
      <Divider />
      <MenuItem
        title="Navigate Right"
        keyBind="RightArrow"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('ArrowRight');
        }}
        disabled={!selection.canChangeCurrentRight}
      />
      <MenuItem
        title="Navigate Left"
        keyBind="LeftArrow"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('ArrowLeft');
        }}
        disabled={!selection.canChangeCurrentLeft}
      />
    </MenuPopup>
  );
}

function ViewMenu() {
  const [view] = useMainView();
  const [runStripVisible] = useRunStripVisible();
  const [primarySidebarVisible] = usePrimarySidebarVisible();

  const popup = useMenuPopupController();

  return (
    <MenuPopup title="View" controller={popup}>
      <MenuItem
        title="Refresh"
        keyBind="Shift+R"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('r', { shiftKey: true });
        }}
      />
      <Divider />
      <MenuItem
        title="Grid View"
        keyBind="G"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('g');
        }}
        selected={view === 'grid'}
      />
      <MenuItem
        title="Table View"
        keyBind="T"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('t');
        }}
        selected={view === 'table'}
      />
      <MenuItem
        title="Run View"
        keyBind="R"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('r');
        }}
        selected={view === 'run'}
      />
      <MenuItem
        title="Compare View"
        keyBind="C"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('c');
        }}
        selected={view === 'compare'}
      />
      <MenuItem
        title="Summaries View"
        keyBind="S"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('s');
        }}
        selected={view === 'summaries'}
      />
      <Divider />
      <MenuItem
        title="Sidebar"
        keyBind="Ctrl+B"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent('b', {ctrlKey: true});
        }}
        selected={primarySidebarVisible}
      />
      <MenuItem
        title="Run Strip"
        keyBind="Ctrl+Space"
        onClick={() => {
          popup.close();
          dispatchKeyDownEvent(' ', { ctrlKey: true });
        }}
        selected={runStripVisible}
      />
    </MenuPopup>
  );
}

function RunsMenu() {
  const popup = useMenuPopupController();

  const run = useCurrentRun();
  const [, selectRunTab] = useCurrentRunTab(run);
  const [view, setView] = useMainView();

  const [source] = useRunsSource();
  const [canDelete, , runsToDelete] = useDeleteSelectedRuns();
  const [canPurge, , runsToPurge] = usePurgeSelectedRuns();
  const [canRestore, restoreRuns, runsToRestore] = useRestoreSelectedRuns();

  return (
    <MenuPopup title="Runs" controller={popup}>
      <MenuItem
        title="Go to Run Files"
        onClick={() => {
          popup.close();
          setView('run');
          selectRunTab('files');
        }}
        disabled={!run}
      />
      <MenuItem
        title="Go to Run Output"
        onClick={() => {
          popup.close();
          setView('run');
          selectRunTab('output');
        }}
        disabled={!run}
      />
      <Divider />
      {['local'].includes(source.type) && (
        <MenuItem
          title={runActionTitle('Delete', runsToDelete, view)}
          keyBind="Del"
          onClick={() => {
            popup.close();
            dispatchKeyDownEvent('Delete');
          }}
          disabled={!canDelete}
        />
      )}
      {['local-deleted'].includes(source.type) && (
        <MenuItem
          title={runActionTitle('Restore', runsToRestore, view)}
          onClick={() => {
            popup.close();
            restoreRuns();
          }}
          disabled={!canRestore}
        />
      )}
      {['local-deleted', 'local-archive'].includes(source.type) && (
        <MenuItem
          title={runActionTitle('Permanently Delete', runsToPurge, view)}
          keyBind="Del"
          onClick={() => {
            popup.close();
            dispatchKeyDownEvent('Delete');
          }}
          disabled={!canPurge}
        />
      )}
    </MenuPopup>
  );
}

function runActionTitle(action: string, runs: Run[], view: string): string {
  return `${action} ${
    runs.length > 1 ? 'Selected Runs' : view === 'run' ? 'Run' : 'Selected Run'
  }`;
}

export default function AppMenubar() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <SelectionMenu />
      <ViewMenu />
      <RunsMenu />
    </div>
  );
}
