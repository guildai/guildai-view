import React from 'react';

import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Stack,
  Table,
  Typography
} from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import {
  DataObject,
  FlagOutlined,
  Input,
  KeyboardArrowDownRounded,
  KeyboardArrowRightRounded,
  Output,
  ReadMore,
  TextSnippetOutlined,
  UnfoldLess,
  UnfoldMore,
  YardOutlined
} from '@mui/icons-material';

import Conditional from './components/Conditional';
import EmptyPanel from './components/EmptyPanel';
import EmptyView from './components/EmptyView';
import Labeled from './components/Labeled';
import Panel from './components/Panel';
import ParagraphButton from './components/ParagraphButton';
import TagList from './components/TagList';
import TextFileDiffTable from './components/TextFileDiffTable';
import ToggleList from './components/ToggleList';
import ToolbarButton from './components/ToolbarButton';
import Tooltip from './components/Tooltip';

import OneTwoThree from './icons/OneTwoThree';
import { default as MetadataIcon } from './icons/Metadata';

import RunCompareMarker from './RunCompareMarker';
import RunSortSelect from './RunSortSelect';
import RunStatusIcon from './RunStatusIcon';

import { MainViewContent, MainViewFooter, MainViewHeader } from './MainView';
import MainViewToolbar from './MainViewToolbar';

import { useCompare } from './selection';

import {
  runStatusLabel,
  useRunFileDiff,
  useRunFiles,
  useRunFlags,
  useRunImages,
  useRunScalars,
  useRunTags,
  useRunTextFiles,
  useSelectedRuns
} from './runs';

import {
  assert,
  cmpNat,
  formatFlagValue,
  formatRunDate,
  formatRunDuration,
  formatScalar,
  isNumber,
  useRefreshListener
} from './utils';

import { ReactState, Refresh, Run, RunFile } from './types';

import { apiBaseUrl } from './prefs';

type FileCompareProps = {
  lhs: Run;
  rhs: Run;
  path: string;
  lhsSkipPath?: boolean;
  rhsSkipPath?: boolean;
};

type RowProps = {
  label?: string;
  lhs: React.ReactNode;
  rhs: React.ReactNode;
  diff?: boolean;
  format?: (arg0: any) => string;
};

type SectionPanelProps = {
  name: SectionName;
  title: string;
  details?: string;
  children: React.ReactNode;
};

function SectionPanel({ name, title, details, children }: SectionPanelProps) {
  const [state, toggle] = useSelectionExpandedState(name);
  return (
    <Panel title={title} details={details} state={state} onToggle={toggle}>
      {children}
    </Panel>
  );
}

function ValueCell({
  val,
  format
}: {
  val: any;
  format: (arg0: any) => string;
}) {
  const formatted = format(val);
  return (
    <Tooltip title={formatted} placement="top-start">
      <Typography sx={{ cursor: 'default' }} noWrap>
        {formatted}
      </Typography>
    </Tooltip>
  );
}

function Row({ label, lhs, rhs, diff, format: formatProp }: RowProps) {
  const [, , state] = React.useContext(CompareRunsContext);

  if (state.hideUnchanged && lhs === rhs) {
    return <></>;
  }

  const format = formatProp || (x => x);

  return (
    <tr>
      <td>
        <Tooltip title={label} placement="top-start">
          <Typography
            textColor="text.tertiary"
            fontSize="sm"
            sx={{ cursor: 'default' }}
            noWrap
          >
            {label}
          </Typography>
        </Tooltip>
      </td>
      <td>
        <ValueCell val={lhs} format={format} />
      </td>
      <td>
        {diff ? (
          <Diff lhs={lhs} rhs={rhs} format={format} />
        ) : (
          <ValueCell val={rhs} format={format} />
        )}
      </td>
    </tr>
  );
}

type CompareTableProps = {
  children: React.ReactNode;
  border?: boolean;
  sx?: SxProps;
};

function CompareTable({ sx, border, children }: CompareTableProps) {
  return (
    <Table
      borderAxis={border ? 'bothBetween' : 'none'}
      sx={{
        '& td:nth-of-type(1)': { width: '20%' },
        '& td:nth-of-type(2)': { width: '40%' },
        '& td:nth-of-type(3)': { width: '40%' },
        ...sx
      }}
    >
      <tbody>{children}</tbody>
    </Table>
  );
}

type DiffProps = { lhs: any; rhs: any; format: (arg0: any) => string };

function Diff({ lhs, rhs, format }: DiffProps) {
  return lhs === rhs ? (
    <ValueCell val={rhs} format={format} />
  ) : isNumber(lhs) && isNumber(rhs) ? (
    <NumericDiff lhs={lhs} rhs={rhs} format={format} />
  ) : (
    <TextDiff lhs={format(lhs)} rhs={format(rhs)} />
  );
}

type NumericDiffProps = {
  lhs: any;
  rhs: any;
  format: (arg0: number) => string;
};

function NumericDiff({ lhs, rhs, format }: NumericDiffProps) {
  const bgcolor = rhs > lhs ? 'info.softActiveBg' : 'info.solidActiveBg';
  return (
    <Typography sx={{ bgcolor, px: 1, py: 0.5, borderRadius: '4px' }}>
      {format(rhs)}
    </Typography>
  );
}

type TextDiffProps = {
  lhs: string;
  rhs: string;
};

function TextDiff({ lhs, rhs }: TextDiffProps) {
  if (lhs === rhs) {
    return <span>{rhs}</span>;
  } else {
    const bgcolor = rhs > lhs ? 'info.softActiveBg' : 'info.solidActiveBg';
    return (
      <Typography
        sx={{
          bgcolor,
          px: 1,
          py: 0.5,
          borderRadius: '4px'
        }}
      >
        {rhs || <>&nbsp;</>}
      </Typography>
    );
  }
}

function Metadata() {
  const [lhs, rhs] = useCompareRuns();
  const [lhsTags, refreshLhsTags] = useRunTags(lhs);
  const [rhsTags, refreshRhsTags] = useRunTags(rhs);

  useRefreshListener(refreshLhsTags);
  useRefreshListener(refreshRhsTags);

  return (
    <SectionPanel name="metadata" title="Metadata">
      <CompareTable border sx={{ mt: 1 }}>
        <Row label="Operation" lhs={lhs.operation} rhs={rhs.operation} />
        <Row label="Status" lhs={lhs.status} rhs={rhs.status} />
        <Row
          label="Started"
          lhs={formatRunDate(lhs.started)}
          rhs={formatRunDate(rhs.started)}
        />
        <Row
          label="Stopped"
          lhs={formatRunDate(lhs.stopped)}
          rhs={formatRunDate(rhs.stopped)}
        />
        <Row
          label="Duration"
          lhs={formatRunDuration(lhs.started, lhs.stopped)}
          rhs={formatRunDuration(rhs.started, rhs.stopped)}
        />
        <Row label="ID" lhs={lhs.id} rhs={rhs.id} />
        <Row
          label="Source Code"
          lhs={lhs.sourceCodeDigest}
          rhs={rhs.sourceCodeDigest}
        />
        <Row label="Label" lhs={lhs.label} rhs={rhs.label} />
        <Row
          label="Tags"
          lhs={<TagList tags={lhsTags || []} editable={false} />}
          rhs={<TagList tags={rhsTags || []} editable={false} />}
        />
      </CompareTable>
    </SectionPanel>
  );
}

function Flags() {
  const [lhs, rhs] = React.useContext(CompareRunsContext);

  const lhsFlags = useRunFlags(lhs) || {};
  const rhsFlags = useRunFlags(rhs) || {};
  const names = Object.keys({ ...lhsFlags, ...rhsFlags }).sort(cmpNat);
  const diffCount = names.reduce(
    (acc, name) => (lhsFlags[name] !== rhsFlags[name] ? acc + 1 : acc),
    0
  );

  return (
    <SectionPanel
      name="flags"
      title="Flags"
      details={names.length ? `(${diffCount}/${names.length} differ)` : '(0)'}
    >
      <CompareTable border sx={{ mt: 1 }}>
        {names.map(name => (
          <Row
            key={name}
            label={name}
            lhs={lhsFlags[name]}
            rhs={rhsFlags[name]}
            diff={true}
            format={formatFlagValue}
          />
        ))}
      </CompareTable>
    </SectionPanel>
  );
}

function Scalars() {
  const [lhs, rhs] = React.useContext(CompareRunsContext);

  const lhsScalars = useRunScalars(lhs)[0] || {};
  const rhsScalars = useRunScalars(rhs)[0] || {};

  const tags = Object.keys({ ...lhsScalars, ...rhsScalars }).sort(cmpNat);
  const diffCount = tags.reduce(
    (acc, tag) =>
      lhsScalars[tag]?.lastVal !== rhsScalars[tag]?.lastVal ? acc + 1 : acc,
    0
  );

  const formatScalarOrMissing = (val: number | undefined): string => {
    return val !== undefined ? formatScalar(val) : '';
  };

  return (
    <SectionPanel
      name="scalars"
      title="Scalars"
      details={tags.length > 0 ? `(${diffCount}/${tags.length} differ)` : '(0)'}
    >
      <CompareTable border sx={{ mt: 1 }}>
        {tags.map(tag => (
          <Row
            key={tag}
            label={tag}
            lhs={lhsScalars[tag]?.lastVal}
            rhs={rhsScalars[tag]?.lastVal}
            diff={true}
            format={formatScalarOrMissing}
          />
        ))}
      </CompareTable>
    </SectionPanel>
  );
}

function useSourceCodePaths(run: Run): [Set<string>, Refresh] {
  const [files, refresh] = useRunFiles(run);

  const sourceCodePaths = new Set(
    filterSourceCode(files || []).map(f => f.path)
  );
  return [sourceCodePaths, refresh];
}

function filterSourceCode(files: RunFile[]): RunFile[] {
  return files.filter(f => f.mType === 's');
}

function TextFileCompare({ lhs, rhs, path }: FileCompareProps) {
  const [open, setOpen] = React.useState(false);
  const [changes, setChanges] = React.useState<number | null>(null);
  const [force, setForce] = React.useState(false);

  const [diff, refresh] = useRunFileDiff(lhs, rhs, path, force);

  useRefreshListener(refresh);

  React.useEffect(() => {
    setChanges(diff ? diff.changeCount : null);
    if (diff && diff.changeCount) {
      setOpen(true);
    }
  }, [diff, setChanges, setOpen]);

  const [state] = useCompareViewState();

  if (state.hideUnchanged && diff && diff.changeCount === 0) {
    return <></>;
  }

  return (
    <Box>
      <Button
        component="a"
        size="sm"
        color="neutral"
        variant="plain"
        startDecorator={
          open ? <KeyboardArrowDownRounded /> : <KeyboardArrowRightRounded />
        }
        sx={{ mt: 1, mb: 1, pl: 1 }}
        onClick={() => setOpen(!open)}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center', fontWeight: 'normal' }}
        >
          <Typography fontSize="sm">{path}</Typography>
          {changes !== null && (
            <Typography level="body3" color="neutral">
              (
              {changes === 0
                ? 'unchanged'
                : changes === 1
                ? '1 change'
                : `${changes} changes`}
              )
            </Typography>
          )}
        </Stack>
      </Button>
      {open && (
        <Card
          variant={diff && diff.lines ? 'soft' : 'outlined'}
          sx={{
            '--Card-padding': '0.5rem',
            '--Card-radius': 'var(--joy-radius-sm)'
          }}
        >
          {diff && diff.lines ? (
            <TextFileDiffTable diff={diff} />
          ) : (
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography level="body2" color="neutral">
                <em>
                  File is the same for both runs
                  <ParagraphButton onClick={() => setForce(true)}>
                    View File
                  </ParagraphButton>
                </em>
              </Typography>
            </Stack>
          )}
        </Card>
      )}
    </Box>
  );
}

function SourceCode() {
  const [lhs, rhs] = useCompareRuns();
  const [lhsPaths, refreshLhsPaths] = useSourceCodePaths(lhs);
  const [rhsPaths, refreshRhsPaths] = useSourceCodePaths(rhs);

  useRefreshListener(refreshLhsPaths);
  useRefreshListener(refreshRhsPaths);

  const allPaths = Array.from(new Set([...lhsPaths, ...rhsPaths])).sort(cmpNat);

  return (
    <SectionPanel
      name="sourceCode"
      title="Source Code"
      details={`(${allPaths.length})`}
    >
      <Box mt={1}>
        {allPaths.map(path => (
          <TextFileCompare key={path} lhs={lhs} rhs={rhs} path={path} />
        ))}
      </Box>
    </SectionPanel>
  );
}

function useTextFilePaths(run: Run): [Set<string>, Refresh] {
  const [images, refresh] = useRunTextFiles(run);
  return [new Set(images.map(f => f.path)), refresh];
}

function TextFiles() {
  const [lhs, rhs] = useCompareRuns();

  const [lhsPaths, lhsRefresh] = useTextFilePaths(lhs);
  const [rhsPaths, rhsRefresh] = useTextFilePaths(rhs);

  useRefreshListener(lhsRefresh);
  useRefreshListener(rhsRefresh);

  const allPaths = Array.from(new Set([...lhsPaths, ...rhsPaths])).sort(cmpNat);

  return (
    <SectionPanel
      name="textFiles"
      title="Text Files"
      details={`(${allPaths.length})`}
    >
      <Box mt={1}>
        {allPaths.map(path => (
          <TextFileCompare key={path} lhs={lhs} rhs={rhs} path={path} />
        ))}
      </Box>
    </SectionPanel>
  );
}

function imageUrl(run: Run, path: string): string {
  return `${apiBaseUrl}/runs/${run.id}/files/${path}`;
}

function ImageCompare({
  lhs,
  rhs,
  lhsSkipPath,
  rhsSkipPath,
  path
}: FileCompareProps) {
  const imgStyle = { width: '100%', height: '100%' };

  return (
    <Grid container p={0.5}>
      <Grid xs={6} p={0.5}>
        {!lhsSkipPath && (
          <img alt={path} style={imgStyle} src={imageUrl(lhs, path)} />
        )}
      </Grid>
      <Grid xs={6} p={0.5}>
        {!rhsSkipPath && (
          <img alt={path} style={imgStyle} src={imageUrl(rhs, path)} />
        )}
      </Grid>
    </Grid>
  );
}

function useImagePaths(run: Run): [Set<string>, Refresh] {
  const [images, refresh] = useRunImages(run);
  return [new Set(images.map(f => f.path)), refresh];
}

function Images() {
  const [lhs, rhs] = useCompareRuns();

  const [lhsPaths, lhsRefresh] = useImagePaths(lhs);
  const [rhsPaths, rhsRefresh] = useImagePaths(rhs);

  useRefreshListener(lhsRefresh);
  useRefreshListener(rhsRefresh);

  const allPaths = Array.from(new Set([...lhsPaths, ...rhsPaths])).sort(cmpNat);

  const [hidden, setHidden] = React.useState<string[]>([]);

  const togglePath = (path: string) => {
    const pathHidden = hidden.includes(path);
    if (pathHidden) {
      setHidden(hidden.filter(s => s !== path));
    } else {
      setHidden([path, ...hidden]);
    }
  };

  return (
    <SectionPanel name="images" title="Images" details={`(${allPaths.length})`}>
      {allPaths.length ? (
        allPaths.map(path => {
          const pathHidden = hidden.includes(path);
          return (
            <Box key={path} onClick={() => togglePath(path)}>
              <Typography
                mt={2}
                mb={1}
                level="body1"
                sx={{ cursor: 'pointer' }}
              >
                {path}
                {pathHidden ? '...' : ''}
              </Typography>
              <div style={{ display: pathHidden ? 'none' : undefined }}>
                <ImageCompare
                  lhs={lhs}
                  rhs={rhs}
                  lhsSkipPath={!lhsPaths.has(path)}
                  rhsSkipPath={!rhsPaths.has(path)}
                  path={path}
                />
              </div>
            </Box>
          );
        })
      ) : (
        <EmptyPanel>No images to compare</EmptyPanel>
      )}
    </SectionPanel>
  );
}

function OutputCompare() {
  const [lhs, rhs] = useCompareRuns();

  const [diff, refresh] = useRunFileDiff(lhs, rhs, '.guild/output');

  useRefreshListener(refresh);

  return (
    <SectionPanel name="output" title="Output">
      <Card variant="soft" sx={{ mt: 2, '--Card-padding': '0.5rem' }}>
        <TextFileDiffTable diff={diff} />
      </Card>
    </SectionPanel>
  );
}

type RunHeaderProps = {
  run: Run | undefined;
  marker: any;
  unselectedHelp?: string;
};

function RunHeader({ run, marker, unselectedHelp }: RunHeaderProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <RunCompareMarker>{marker}</RunCompareMarker>
      <Stack sx={{ overflow: 'hidden' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: 0.25 }}
        >
          <Tooltip
            title={(run && runStatusLabel(run.status)) || ''}
            placement="top-start"
          >
            <span>
              {run && <RunStatusIcon status={run.status} size="sm" />}
            </span>
          </Tooltip>
          <Tooltip title={(run && run.operation) || ''} placement="top-start">
            <Typography fontSize="md" noWrap>
              {(run && run.operation) || <>&nbsp;</>}
            </Typography>
          </Tooltip>
        </Stack>
        <Tooltip title={!run ? unselectedHelp : ''} placement="top-start">
          <Typography fontSize="xs" textColor="text.tertiary" noWrap>
            {(run && formatRunDate(run.started)) || <em>Unselected</em>}
          </Typography>
        </Tooltip>
        <Tooltip title={(run && run.label) || ''} placement="top-start">
          <Typography fontSize="xs" textColor="text.secondary" noWrap>
            {(run && run.label) || <>&nbsp;</>}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

function CompareHeader() {
  const [lhs, rhs] = useMaybeCompareRuns();

  return (
    <CompareTable
      sx={{ bgcolor: 'background.surface', py: 1, '--TableCell-paddingY': 0 }}
    >
      <Row
        lhs={
          <RunHeader
            run={lhs}
            marker="A"
            unselectedHelp="Select a run as a basis for comparison"
          />
        }
        rhs={
          <RunHeader
            run={rhs}
            marker="B"
            unselectedHelp={`Select a run to compare${
              !lhs ? ' (Ctrl+click)' : ''
            }`}
          />
        }
      />
    </CompareTable>
  );
}

function CompareToolbar() {
  const [lhs, rhs] = useMaybeCompareRuns();

  const [hideUnchanged, toggleHideUnchanged] = useHideUnchangedState();

  const [sections, toggleSection] = useSections();

  const disabled = !lhs || !rhs;

  const [anySectionsExpanded, toggleExpandCollapseAll] =
    useExpandCollapseAllState();

  const [clearable, clear] = useClearState();

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', mx: 2, my: 0.5 }}
      columnGap={1}
      flexWrap="wrap"
    >
      <Labeled label="Section" tooltip="Show/hide section" disabled={disabled}>
        <ToggleList
          selected={sections}
          tooltipPlacement="bottom-start"
          onChange={e => toggleSection(e.target.value as SectionName)}
          disabled={disabled}
          items={[
            {
              value: 'metadata',
              tooltip: 'Metadata',
              icon: <MetadataIcon />
            },
            {
              value: 'flags',
              tooltip: 'Flags',
              icon: <FlagOutlined />
            },
            {
              value: 'scalars',
              tooltip: 'Scalars',
              icon: <OneTwoThree />
            },
            {
              value: 'sourceCode',
              tooltip: 'Source Code',
              icon: <DataObject />
            },
            {
              value: 'textFiles',
              tooltip: 'Text Files',
              icon: <TextSnippetOutlined />
            },
            {
              value: 'images',
              tooltip: 'Images',
              icon: <YardOutlined />
            },
            {
              value: 'output',
              tooltip: 'Output',
              icon: <ReadMore />
            }
          ]}
        />
      </Labeled>

      {/* <Divider orientation="vertical" sx={{ my: 0.25 }} /> */}

      <Labeled label="Type" tooltip="Show/hide file type" disabled={disabled}>
        <ToggleList
          // selected={[]}
          tooltipPlacement="bottom-start"
          // onChange={e => toggleSection(e.target.value as SectionName)}
          disabled={disabled}
          items={[
            {
              value: 'd',
              tooltip: 'Dependencies',
              icon: <Input />
            },
            {
              value: 'g',
              tooltip: 'Generated',
              icon: <Output />
            }
          ]}
        />
      </Labeled>

      <Tooltip title="Clear all filters">
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          disabled={!clearable}
          onClick={clear}
          sx={{ fontWeight: 'unset', mr: 1 }}
        >
          Clear
        </Button>
      </Tooltip>

      {/* <Divider orientation="vertical" sx={{ my: 0.25 }} /> */}

      <Checkbox
        checked={hideUnchanged}
        disabled={disabled}
        label="Hide unchanged"
        size="sm"
        variant="outlined"
        onChange={toggleHideUnchanged}
        sx={{ color: 'text.tertiary' }}
      />
      <div style={{ flex: 1 }} />
      <ToolbarButton
        tooltip={
          anySectionsExpanded ? 'Collapse All Sections' : 'Expand All Sections'
        }
        icon={anySectionsExpanded ? <UnfoldLess /> : <UnfoldMore />}
        onClick={toggleExpandCollapseAll}
      />
    </Stack>
  );
}

function ViewConfig() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      <Labeled label="Sort">
        <RunSortSelect />
      </Labeled>
    </Stack>
  );
}

function useCompareRun(selected: Run[]): Run | undefined {
  const [, compare] = useCompare();
  return compare ? selected.find(run => run.id === compare) : undefined;
}

type CompareViewState = {
  sections: Set<SectionName>;
  expanded: Set<SectionName>;
  hideUnchanged: boolean;
};

type SectionName =
  | 'metadata'
  | 'flags'
  | 'scalars'
  | 'sourceCode'
  | 'textFiles'
  | 'images'
  | 'output';

const allSections: SectionName[] = [
  'metadata',
  'flags',
  'scalars',
  'sourceCode',
  'textFiles',
  'images',
  'output'
];

function initStateValue(): CompareViewState {
  return {
    sections: new Set([]),
    hideUnchanged: false,
    expanded: new Set(['metadata', 'flags'])
  };
}

function sectionActive(state: CompareViewState, name: SectionName) {
  return state.sections.size === 0 || state.sections.has(name);
}

const CompareRunsContext = React.createContext<
  [
    Run | undefined,
    Run | undefined,
    CompareViewState,
    (arg0: CompareViewState) => void
  ]
>([undefined, undefined, {} as CompareViewState, () => {}]);

function useCompareRuns(): [Run, Run] {
  const [lhs, rhs] = React.useContext(CompareRunsContext);
  assert(lhs);
  assert(rhs);
  return [lhs!, rhs!];
}

function useMaybeCompareRuns(): [Run | undefined, Run | undefined] {
  const [lhs, rhs] = React.useContext(CompareRunsContext);
  return [lhs, rhs];
}

function useCompareViewState(): ReactState<CompareViewState> {
  const [, , state, setState] = React.useContext(CompareRunsContext);
  return [state, setState];
}

function useSections(): [SectionName[], (arg0: SectionName) => void] {
  const [state, setState] = useCompareViewState();

  const sections = state.sections;

  const toggleSection = (name: SectionName) => {
    if (sections.has(name)) {
      setState({
        ...state,
        sections: new Set([...sections].filter(s => s !== name))
      });
    } else {
      setState({
        ...state,
        sections: new Set([...sections, name]),
        // Ensure selected section is expanded
        expanded: new Set([...state.expanded, name])
      });
    }
  };

  return [[...sections], toggleSection];
}

function useSelectionExpandedState(name: SectionName): [boolean, () => void] {
  const [state, setState] = useCompareViewState();

  const sectionExpanded = state.expanded.has(name);

  const toggleExpanded = () => {
    const expanded = sectionExpanded
      ? new Set([...state.expanded].filter(x => x !== name))
      : new Set([...state.expanded, name]);
    setState({ ...state, expanded });
  };

  return [sectionExpanded, toggleExpanded];
}

function useHideUnchangedState(): [boolean, () => void] {
  const [state, setState] = useCompareViewState();

  const hideUnchanged = state.hideUnchanged;

  const toggleHideUnchanged = () => {
    setState({
      ...state,
      hideUnchanged: !hideUnchanged
    });
  };

  return [hideUnchanged, toggleHideUnchanged];
}

function useExpandCollapseAllState(): [boolean, () => void] {
  const [state, setState] = useCompareViewState();

  const expanded = state.expanded.size > 0;

  const toggle = () => {
    if (expanded) {
      setState({ ...state, expanded: new Set() });
    } else {
      setState({ ...state, expanded: new Set(allSections) });
    }
  };

  return [expanded, toggle];
}

function useClearState(): [boolean, () => void] {
  const [state, setState] = useCompareViewState();

  const clearable = state.sections.size > 0;

  const clear = () => {
    setState({ ...state, sections: new Set() });
  };

  return [clearable, clear];
}

export default function CompareView() {
  const [selected, current] = useSelectedRuns();
  const compare = useCompareRun(selected);

  const [state, setState] = React.useState<CompareViewState>(initStateValue());

  return (
    <CompareRunsContext.Provider value={[current, compare, state, setState]}>
      <MainViewHeader sx={{ p: 0 }}>
        <CompareHeader />
        <Divider />
        <CompareToolbar />
      </MainViewHeader>
      <MainViewContent>
        {current && compare ? (
          <Stack>
            <Conditional active={sectionActive(state, 'metadata')}>
              <Metadata />
            </Conditional>
            <Conditional active={sectionActive(state, 'flags')}>
              <Flags />
            </Conditional>
            <Conditional active={sectionActive(state, 'scalars')}>
              <Scalars />
            </Conditional>
            <Conditional active={sectionActive(state, 'sourceCode')}>
              <SourceCode />
            </Conditional>
            <Conditional active={sectionActive(state, 'textFiles')}>
              <TextFiles />
            </Conditional>
            <Conditional active={sectionActive(state, 'images')}>
              <Images />
            </Conditional>
            <Conditional active={sectionActive(state, 'output')}>
              <OutputCompare />
            </Conditional>
          </Stack>
        ) : current ? (
          <EmptyView>Select a run to compare</EmptyView>
        ) : (
          <EmptyView>Select a run as a basis for comparison</EmptyView>
        )}
      </MainViewContent>
      <MainViewFooter>
        <MainViewToolbar endDecorator={<ViewConfig />} />
      </MainViewFooter>
    </CompareRunsContext.Provider>
  );
}
