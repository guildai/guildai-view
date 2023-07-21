import React from 'react';

import { Box, Divider, Sheet, Stack, Typography } from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import NameValueTable, { NameValueItem, ValueCell } from './components/NameValueTable';
import Panel from './components/Panel';
import TagList from './components/TagList';
import ValueInput from './components/ValueInput';

import RunLink from './RunLink';
import RunOperationLabel from './RunOperationLabel';
import RunToolbar from './RunToolbar';

import { useMainView } from './mainView';

import {
  useHoverOrCurrentRun,
  useRunComments,
  useRunFlags,
  useRunProcessInfo,
  useRunScalars,
  useRunTags,
  useSetRunLabel,
  useSetRunTags,
  useTextFilter
} from './runs';

import {
  cmpNat,
  formatFlagValue,
  formatRunDate,
  formatRunDuration,
  formatScalarLastVal,
  isRunId,
  useRefreshListener
} from './utils';

import { Run, RunFlags, RunScalars } from './types';

type RunPanelProps = {
  run: Run | undefined;
  sx?: SxProps;
};

function Metadata({ run, sx }: RunPanelProps) {
  const [setLabel, pendingLabel] = useSetRunLabel(run);
  const [tags, refreshTags] = useRunTags(run);
  const [setTags, pendingTags] = useSetRunTags(run);
  const [, setFilter] = useTextFilter();
  const [, setView] = useMainView();

  useRefreshListener(refreshTags);

  return (
    <Panel title="Metadata" sx={sx}>
      <NameValueTable
        items={[
          ['Operation', run ? <RunOperationLabel run={run} /> : ''],
          ['Status', run ? run.status : ''],
          ['Started', run ? formatRunDate(run.started) : ''],
          ['Stopped', run ? formatRunDate(run.stopped) : ''],
          ['Duration', run ? formatRunDuration(run.started, run.stopped) : ''],
          ['ID', run ? run.id : ''],
          ['Location', run ? run.dir : ''],
          ['Source Code', run ? run.sourceCodeDigest : ''],
          [
            'Label',
            <ValueInput
              sx={{ m: '0 -0.5rem' }}
              disabled={run === undefined}
              value={run ? pendingOrRunLabel(pendingLabel, run) : ''}
              onChange={value => setLabel(value)}
            />
          ],
          [
            'Tags',
            <TagList
              sx={{ m: '0 -0.5rem' }}
              tags={pendingTags || tags || []}
              editable={run !== undefined}
              onTagClick={tag => {
                setFilter(`/tags contains ${maybeQuote(tag)}`);
                setView('grid');
              }}
              onTagsEdit={setTags}
            />
          ]
        ]}
      />
    </Panel>
  );
}

function pendingOrRunLabel(pending: string | undefined, run: Run): string {
  return pending !== undefined ? pending : run.label;
}

function maybeQuote(s: string) {
  return s.indexOf(' ') !== -1 ? `'${s}'` : s;
}

function Flags({ run, sx }: RunPanelProps) {
  const flags = useRunFlags(run);

  return (
    <Panel title="Flags" sx={sx}>
      {(flags && Object.keys(flags).length && (
        <NameValueTable items={formatFlags(flags)} />
      )) ||
        (flags && <Empty>No flags</Empty>)}
    </Panel>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Typography fontSize="sm" textColor="text.tertiary" p={1} pt={2}>
      <em>{children}</em>
    </Typography>
  );
}

function formatFlags(
  flags: RunFlags | undefined
): [string, string | React.ReactNode][] {
  if (!flags) {
    return [];
  }
  const sortedKeys = Object.keys(flags).sort(cmpNat);
  return sortedKeys.map(key => [key, formatFlag(flags[key])]);
}

function formatFlag(val: any) {
  return isRunId(val) ? (
    <RunLink runId={val as string} />
  ) : (
    formatFlagValue(val)
  );
}

function Scalars({ run, sx }: RunPanelProps) {
  const [scalars, refresh] = useRunScalars(run);

  useRefreshListener(refresh);

  return (
    <Panel title="Scalars" sx={sx}>
      {(scalars && Object.keys(scalars).length && (
        <NameValueTable items={formatScalars(scalars)} />
      )) ||
        (scalars && <Empty>No scalars</Empty>)}
    </Panel>
  );
}

function formatScalars(scalars: RunScalars): [string, string][] {
  return Object.keys(scalars)
    .sort(cmpNat)
    .map(tag => [tag, formatScalarLastVal(scalars[tag])]);
}

type CommentProps = {
  user: string;
  host: string;
  date: string;
  children: React.ReactNode;
};

function Comment({ user, host, date, children }: CommentProps) {
  return (
    <Sheet
      variant="plain"
      sx={{
        margin: '1em 0'
      }}
    >
      <Box>
        <Typography level="body2">
          {user}@{host}
        </Typography>
        <Typography level="body3">{date}</Typography>
      </Box>
      <Typography level="body2">{children}</Typography>
    </Sheet>
  );
}

function Comments({ run, sx }: RunPanelProps) {
  const [comments, refresh] = useRunComments(run);

  useRefreshListener(refresh);

  return (
    <Panel title="Comments" sx={sx}>
      {comments && comments.length ? (
        <Stack divider={<Divider />}>
          {(comments || []).map((c, i) => (
            <Comment
              key={i}
              user={c.user}
              host={c.host}
              date={formatRunDate(c.time)}
            >
              {c.body}
            </Comment>
          ))}
        </Stack>
      ) : (
        comments && <Empty>No comments</Empty>
      )}
    </Panel>
  );
}

function ProcessInfoTable({ run }: { run: Run }) {
  const [info, refresh] = useRunProcessInfo(run);

  useRefreshListener(refresh);

  return (
    <>
      <NameValueTable
        items={[
          ['Exit Status', info?.exitStatus],
          ['Command', <ValueCell>{formatCommand(info?.command)}</ValueCell>]
        ]}
      />
      <Typography
        color="neutral"
        level="body3"
        sx={{ mt: 1, cursor: 'default', textTransform: 'uppercase' }}
      >
        Environment
      </Typography>
      <NameValueTable items={formatEnvironment(info?.environment)} />
    </>
  );
}

function formatCommand(cmd: string[] | undefined | null): string {
  return (cmd || []).join(' ');
}

function formatEnvironment(
  env: { [key: string]: string } | undefined | null
): NameValueItem[] {
  if (!env) {
    return [];
  }
  return Object.keys(env)
    .sort(cmpNat)
    .map(name => [name, env[name]]);
}

function ProcessInfo({ run, sx }: RunPanelProps) {
  const [active, setActive] = React.useState(false);

  return (
    <Panel
      title="Process"
      state={active}
      onToggle={() => setActive(!active)}
      sx={sx}
    >
      {active && run && <ProcessInfoTable run={run} />}
    </Panel>
  );
}

export default function RunSidebar() {
  const run = useHoverOrCurrentRun();

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Stack>
        <RunToolbar />
        <Metadata run={run} sx={{ mt: '-4px' }} />
        <Flags run={run} />
        <Scalars run={run} />
        <Comments run={run} />
        <ProcessInfo run={run} />
      </Stack>
    </Box>
  );
}
