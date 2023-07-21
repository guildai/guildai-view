import numeral from 'numeral';

import { Chip, Stack, Table, Typography } from '@mui/joy';

import { SxProps } from '@mui/joy/styles/types';

import Tooltip from './components/Tooltip';

import { ImageFeature, ScalarFeature } from './features';
import { formatScalar, range } from './utils';

type ScalarFeatureProps = {
  scalar: ScalarFeature;
  sx?: SxProps;
};

function formatCompactValue(val: number): string {
  const fmt = val >= 100000 ? '0.00e+0' : val >= 10 ? '0.00' : '0.000';
  return numeral(val).format(fmt);
}

function ScalarValue({ scalar, sx }: ScalarFeatureProps) {
  return (
    <Tooltip title={formatScalar(scalar.value)} placement="top-start">
      <Typography fontSize="md" sx={{ minWidth: null, ...sx }} noWrap>
        {formatCompactValue(scalar.value)}
      </Typography>
    </Tooltip>
  );
}

function ScalarTag({ scalar, sx }: ScalarFeatureProps) {
  return (
    <Tooltip title={scalar.tag} placement="top-start">
      <Chip
        size="sm"
        variant="outlined"
        color="neutral"
        sx={{
          bgcolor: 'var(--joy-palette-background-level1)',
          overflow: 'hidden',
          '--Chip-minHeight': '12px',
          '--Chip-radius': '6px',
          '--Chip-paddingInline': '4px',
          ...sx
        }}
      >
        <Typography level="body4" noWrap fontSize="xs2">
          {scalar.tag}
        </Typography>
      </Chip>
    </Tooltip>
  );
}

function OneScalar({ scalar }: ScalarFeatureProps) {
  return (
    <Stack
      direction="row"
      gap={1}
      sx={{ alignItems: 'center', overflow: 'hidden' }}
    >
      <ScalarValue scalar={scalar} sx={{ flex: '0 0 auto' }} />
      <ScalarTag scalar={scalar} sx={{ flex: '0 1 auto' }} />
    </Stack>
  );
}

type ScalarsTableProps = {
  scalars: ScalarFeature[];
  sx?: SxProps;
};

function ScalarsTable({ scalars, sx }: ScalarsTableProps) {
  return (
    <Table
      size="sm"
      borderAxis="none"
      sx={{
        '--TableCell-height': '1rem',
        '--TableCell-paddingY': 0,
        '--TableCell-paddingX': 0,
        ...sx
      }}
    >
      <tbody>
        {scalars.map((s, i) => (
          <tr key={`scalar-${i}`}>
            <td>
              <ScalarValue
                scalar={s}
                sx={{ maxWidth: '100%', lineHeight: '1.45rem' }}
              />
            </td>
            <td>
              <ScalarTag scalar={s} sx={{ maxWidth: '100%' }} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

type ScalarFeaturesProps = {
  scalars: ScalarFeature[];
  cols: number;
};

function ScalarsOnly({ scalars, cols }: ScalarFeaturesProps) {
  const rows = Math.ceil(scalars.length / cols);
  return (
    <Stack direction="row" gap={1} alignItems="start">
      {range(cols).map(i => (
        <ScalarsTable
          key={`table-${i}`}
          scalars={scalars.slice(i * rows, (i + 1) * rows)}
        />
      ))}
    </Stack>
  );
}

type ImageProps = {
  image: ImageFeature;
  maxHeight?: string;
};

function Image({ image, maxHeight }: ImageProps) {
  return (
    <Tooltip title={image.name} placement="right">
      <img
        alt={image.name}
        src={image.url}
        style={{
          maxWidth: '100%',
          maxHeight: maxHeight,
          margin: 'auto',
          borderRadius: '0.25rem',
          border: '1px solid var(--joy-palette-neutral-outlinedBorder)'
        }}
      />
    </Tooltip>
  );
}

type ImagesAndScalarsProps = {
  images: ImageFeature[];
  scalars: ScalarFeature[];
};

function ImagesAndScalars({ images, scalars }: ImagesAndScalarsProps) {
  return (
    <Stack direction="row" alignItems="start" gap={1}>
      <Stack sx={{ py: 0.5 }} gap={1}>
        {images.map((image, i) => (
          <Image key={`img-${i}`} image={image} />
        ))}
      </Stack>
      <ScalarsTable
        scalars={scalars}
        sx={{
          width: 'unset',
          '& td:nth-of-type(1)': { pr: 0.5 },
          '& td:nth-of-type(2)': { pl: 0.5 }
        }}
      />
    </Stack>
  );
}

type ImagesOnlyProps = {
  images: ImageFeature[];
  cols: number;
};

function ImagesOnly({ images, cols }: ImagesOnlyProps) {
  const rows = Math.ceil(images.length / cols);
  return (
    <Table size="sm" borderAxis="none">
      <tbody>
        {range(rows).map(i => (
          <tr key={`row-${i}`}>
            {images.slice(i * rows, (i + 1) * rows).map((image, j) => (
              <td key={`col-${j}`}>
                <Image key={`img-${i}`} image={image} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

type RunCardFeaturesProps = {
  scalars?: ScalarFeature[];
  images?: ImageFeature[];
  scalarCols?: number;
  imageCols?: number;
};

export default function RunCardFeatures({
  images,
  scalars,
  scalarCols,
  imageCols
}: RunCardFeaturesProps) {
  return images && images.length > 0 ? (
    scalars && scalars.length > 0 ? (
      <ImagesAndScalars images={images} scalars={scalars} />
    ) : (
      <ImagesOnly images={images} cols={imageCols || 1} />
    )
  ) : scalars && scalars.length === 1 ? (
    <OneScalar scalar={scalars[0]} />
  ) : scalars && scalars.length > 1 ? (
    <ScalarsOnly scalars={scalars} cols={scalarCols || 1} />
  ) : (
    <></>
  );
}
