export type ReactState<T> = [T, (arg0: T) => void];

export type Refresh = () => void;

export type Run = {
  id: string;
  dir: string;
  operation: string;
  status: RunStatus;
  label: string;
  started: number | null;
  stopped: number | null;
  deleted: boolean;
  sourceCodeDigest: string | null;
};

export type RunFlags = { [key: string]: any };

export type RunScalar = {
  avgVal: number;
  count: number;
  firstStep: number;
  firstVal: number;
  lastStep: number;
  lastVal: number;
  maxStep: number;
  maxVal: number;
  minStep: number;
  minVal: number;
  prefix: string;
  total: number;
};

export type RunScalars = { [tag: string]: RunScalar };

export type ManifestType =
  | 's' // source code
  | 'd' // dependency
  | 'i' // internal
  | 'g'; // generated (implied)

export type RunFile = {
  name: string;
  path: string;
  type: string | null;
  encoding: string | null;
  mType: ManifestType | null;
  isFile: boolean;
  isDir: boolean;
  isLink: boolean;
  isText: boolean;
  size: number;
  mtime: number;
  hash: string | null;
  files: RunFile[] | null;
};

export type RunComment = {
  time: number;
  host: string;
  user: string;
  body: string;
};

export type RunStatus =
  | 'running'
  | 'completed'
  | 'terminated'
  | 'error'
  | 'staged'
  | 'pending'
  | 'unknown';

export type RunProcessInfo = {
  exitStatus: number | null;
  command: string[] | null;
  environment: { [key: string]: string } | null;
};

export type RunCompareData = {
  flags: RunFlags;
  scalars: RunScalars;
};

export type RunsCompare = {
  [runId: string]: RunCompareData;
};

type ScalarTag = string;
type ScalarValue = number;
type ScalarStep = number;

export type RunScalarsData = {
  [path: string]: [ScalarTag, ScalarValue, ScalarStep][];
};

export type RunsScalars = {
  [runId: string]: RunScalarsData;
};

export type RunSortType = 'attr' | 'flag' | 'scalar';

export type RunSort = { type: RunSortType; name: string; desc?: boolean };

export type Collection = {
  id: string;
  idPath: string;
  label: string;
  help?: string;
  filter?: string;
  started?: string;
  status?: string | string[];
  run?: string | string[];
  collections?: Collection[];
};

export type Archive = {
  id: string;
  path: string;
  label?: string;
  description?: string;
};

export type DiffLine = [
  [number | null, string],
  [number | null, string],
  boolean
];

export type FileDiff = {
  changeCount: number;
  lines: DiffLine[] | null;
  lhsLineCount: number | null;
  rhsLineCount: number | null;
};
