import React from 'react';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography
} from '@mui/joy';

import { Folder, FolderSpecial } from '@mui/icons-material';

import KeyDownBoundary from './components/KeyDownBoundary';
import ListSubheaderToggle from './components/ListSubheaderToggle';
import Panel from './components/Panel';
import Tooltip from './components/Tooltip';

import { useCollection, useCollections } from './runs';
import { ToggleState, useRefreshListener, useToggleState } from './utils';

import { Collection } from './types';

type CollectionListItemProps = {
  collection: Collection;
  openState: ToggleState<string>;
};

function NestedCollectionsListItem({
  collection,
  openState
}: CollectionListItemProps) {
  const [isOpen, toggleOpen] = openState;

  return (
    <ListItem nested>
      <ListSubheaderToggle
        open={isOpen(collection.idPath)}
        onClick={() => toggleOpen(collection.idPath)}
      >
        {collection.label}
      </ListSubheaderToggle>
      {isOpen(collection.idPath) && (
        <List size="sm" sx={{ '--List-gap': '0px' }}>
          {(collection.collections || []).map((c, i) => (
            <CollectionListItem
              key={`${c.id}-${i}`}
              collection={c}
              openState={openState}
            />
          ))}
        </List>
      )}
    </ListItem>
  );
}

function CollectionListItem({
  collection,
  openState
}: CollectionListItemProps) {
  const [current, setCurrent] = useCollection();
  const selected = collection.idPath === current?.idPath;

  return collection.collections ? (
    <NestedCollectionsListItem collection={collection} openState={openState} />
  ) : (
    <ListItem>
      <Tooltip title={collection.help || collection.label} placement="right">
        <ListItemButton
          color={selected ? 'info' : 'neutral'}
          variant={selected ? 'soft' : 'plain'}
          selected={selected}
          onClick={() => {
            if (selected) {
              setCurrent(null);
            } else {
              setCurrent(collection);
            }
          }}
        >
          <ListItemDecorator>
            {iconForCollectionType('smart')}
          </ListItemDecorator>
          <ListItemContent>
            <Typography level="body2" noWrap>
              {collection.label}
            </Typography>
          </ListItemContent>
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

function iconForCollectionType(type: string | undefined) {
  switch (type) {
    case 'smart':
      return <FolderSpecial />;
    default:
      return <Folder />;
  }
}

function useInitialCollectionOpenState(
  collections: Collection[] | undefined,
  openState: ToggleState<string>
) {
  // Ensure the first N collection sets are open.
  const FIRST_N = 3;

  const [openInit, setOpenInit] = React.useState(false);
  const [, , setOpen] = openState;

  React.useEffect(() => {
    if (!openInit && collections && collections.length) {
      setOpen(
        collections
          .filter(c => c.collections)
          .slice(0, FIRST_N)
          .map(c => c.idPath)
      );
      setOpenInit(true);
    }
  }, [openInit, setOpen, collections, setOpenInit]);
}

export default function CollectionsPanel() {
  const [collections, refresh] = useCollections();

  useRefreshListener(refresh);

  const openState = useToggleState<string>();

  useInitialCollectionOpenState(collections, openState);

  return (
    <Panel title="Collections">
      <KeyDownBoundary navOnly>
        <List
          size="sm"
          sx={{
            '--List-gap': '0px',
            '& .JoyListItemButton-root': { p: '8px' }
          }}
        >
          {(collections || []).map((c, i) => (
            <CollectionListItem
              key={`${c.id}-${i}`}
              collection={c}
              openState={openState}
            />
          ))}
        </List>
      </KeyDownBoundary>
    </Panel>
  );
}
