import { Link, Stack, Typography } from '@mui/joy';

import Tooltip from './components/Tooltip';

import RunOperationLabel, { DeletedRunAttr } from './RunOperationLabel';
import RunStatusIcon from './RunStatusIcon';

import { useRun } from './runs';
import { useKeySelectedClicked } from './selection';

import { Run } from './types';
import { formatRunDate } from './utils';

type RunTooltipProps = {
  run: Run;
};

function RunTooltip({ run }: RunTooltipProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.6} flexWrap="wrap">
      <span>
        <RunStatusIcon status={run.status} size="sm" />
      </span>
      <Typography fontSize="sm">
        <RunOperationLabel run={run} />
      </Typography>
      <Typography level="body3" noWrap>
        - {formatRunDate(run.started)}
      </Typography>
      <Typography level="body3" noWrap>
        - {run.label}
      </Typography>
    </Stack>
  );
}

type RunLinkProps = {
  runId: string;
};

export default function RunLink({ runId }: RunLinkProps) {
  const run = useRun(runId);
  const [, , clicked] = useKeySelectedClicked(runId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clicked();
  };

  return (
    <Tooltip
      title={run ? <RunTooltip run={run} /> : runId}
      placement="top-start"
    >
      <Typography
        noWrap
        level="body2"
        sx={{ cursor: 'default', display: 'inline' }}
      >
        {run && run.deleted ? (
          <DeletedRunAttr value={runId} />
        ) : (
          <Link onClick={handleClick}>{runId}</Link>
        )}
      </Typography>
    </Tooltip>
  );
}
