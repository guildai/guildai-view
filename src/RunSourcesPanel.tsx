import React from 'react';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography
} from '@mui/joy';

import { FolderDelete, Folder, Inventory2 } from '@mui/icons-material';

import KeyDownBoundary from './components/KeyDownBoundary';
import ListSubheaderToggle from './components/ListSubheaderToggle';
import Panel from './components/Panel';
import Tooltip from './components/Tooltip';

import { LocalArchiveRuns, useArchives, useRunsSource } from './runs';

import { useRefreshListener, useToggleState } from './utils';

type SourceListItemProps = {
  label: string;
  icon: React.ReactNode;
  help?: React.ReactNode;
  selected?: boolean;
  onClick?: React.MouseEventHandler;
};

function SourceListItem({
  label,
  help,
  icon,
  selected,
  onClick
}: SourceListItemProps) {
  return (
    <ListItem>
      <Tooltip title={help || label} placement="right">
        <ListItemButton
          color={selected ? 'info' : 'neutral'}
          variant={selected ? 'soft' : 'plain'}
          selected={selected}
          onClick={onClick}
        >
          <ListItemDecorator sx={{ minInlineSize: '1.67em' }}>
            {icon}
          </ListItemDecorator>
          <ListItemContent>
            <Typography level="body2" noWrap>
              {label}
            </Typography>
          </ListItemContent>
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

export default function RunSourcePanel() {
  const [archives, refreshArchives] = useArchives();

  useRefreshListener(refreshArchives);

  const [source, setSource] = useRunsSource();

  const [sectionOpen, toggleSection] = useToggleState<string>();

  return (
    <Panel title="Sources">
      <KeyDownBoundary navOnly>
        <List
          sx={{
            '--List-gap': '0px',
            '& .JoyListItemButton-root': { p: '8px' }
          }}
        >
          <SourceListItem
            label="Local Runs"
            help="Runs in local repository"
            icon={<Folder />}
            selected={source.type === 'local'}
            onClick={() => setSource({ type: 'local' })}
          />
          <SourceListItem
            label="Deleted"
            help="Deleted runs"
            icon={<FolderDelete />}
            selected={source.type === 'local-deleted'}
            onClick={() => setSource({ type: 'local-deleted' })}
          />
          {archives && archives.length > 0 && (
            <ListItem nested>
              <ListSubheaderToggle
                open={sectionOpen('archives')}
                onClick={() => toggleSection('archives')}
              >
                Archives
              </ListSubheaderToggle>
              {sectionOpen('archives') && (
                <List size="sm" sx={{ '--List-gap': '0px' }}>
                  {archives.map((a, i) => (
                    <SourceListItem
                      key={`${a.id}-${i}`}
                      label={a.label || a.id}
                      help={
                        a.description ? (
                          <>
                            Local archive
                            <span
                              style={{
                                marginLeft: '1em',
                                color: 'var(--joy-palette-text-secondary)',
                                fontStyle: 'italic'
                              }}
                            >
                              {a.description}
                            </span>
                          </>
                        ) : (
                          'Local archive'
                        )
                      }
                      icon={<Inventory2 />}
                      selected={
                        source.type === 'local-archive' &&
                        (source as LocalArchiveRuns).archive.id === a.id
                      }
                      onClick={() => {
                        setSource({ type: 'local-archive', archive: a });
                      }}
                    />
                  ))}
                </List>
              )}
            </ListItem>
          )}
        </List>
      </KeyDownBoundary>
    </Panel>
  );
}
