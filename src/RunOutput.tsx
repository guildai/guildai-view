import RunFile from './RunFile';
import { Run } from './types';

type RunOutputProps = {
  run: Run;
};

export default function RunOutput({ run }: RunOutputProps) {
  return <RunFile run={run} path=".guild/output" />;
}
