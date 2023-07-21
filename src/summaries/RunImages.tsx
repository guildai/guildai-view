import React from 'react';

import { Grid, Stack, Typography } from '@mui/joy';

import Tooltip from '../components/Tooltip';

import RunStatusIcon from '../RunStatusIcon';

import { runStatusLabel, useRunFile, useRunImages } from '../runs';

import { formatRunDate, useRefreshListener } from '../utils';

import { Run } from '../types';

type RunImageProps = {
  run: Run;
  path: string;
  name?: string;
};

function RunImage({ run, path, name }: RunImageProps) {
  const [file] = useRunFile(run, path);

  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (file && ref.current) {
      ref.current.src = URL.createObjectURL(file);
    }
  }, [ref, file]);

  return (
    <Tooltip title={name}>
      <img ref={ref} alt={name} style={{ width: '100%', height: '100%' }} />
    </Tooltip>
  );
}

type RunImagesProps = {
  run: Run;
};

export default function RunImages({ run }: RunImagesProps) {
  const [images, refresh] = useRunImages(run);

  useRefreshListener(refresh);

  return (
    <Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ mb: 0.25 }}
      >
        <Tooltip title={runStatusLabel(run.status)} placement="top-start">
          <span>
            <RunStatusIcon status={run.status} size="sm" />
          </span>
        </Tooltip>
        <Tooltip title={run.operation} placement="top-start">
          <Typography fontSize="lg" noWrap>
            {run.operation}
          </Typography>
        </Tooltip>
      </Stack>
      <Typography level="body3" noWrap>
        {formatRunDate(run.started)}
      </Typography>
      <Tooltip title={run.label} placement="top-start">
        <Typography noWrap sx={{ flex: 1 }} level="body2">
          {run.label}
        </Typography>
      </Tooltip>
      <Grid container p={0.5}>
        {images.map(img => (
          <Grid key={img.path} xs={12} lg={6} xl={4} p={0.5}>
            <RunImage run={run} path={img.path} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
