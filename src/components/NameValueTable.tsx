import React from 'react';

import { Table, Typography } from '@mui/joy';

import Tooltip from './Tooltip';

import { isString } from '../utils';

export function ValueCell({
  children,
  noWrap
}: {
  children: React.ReactNode;
  noWrap?: boolean;
}) {
  return (
    <Tooltip title={children} placement="top-start">
      <Typography
        fontSize="sm"
        sx={{ cursor: 'default', whiteSpace: noWrap ? 'no-wrap' : 'normal' }}
      >
        {children}
      </Typography>
    </Tooltip>
  );
}

type NameValueRowProps = {
  name: string;
  value: string | React.ReactNode;
};

function NameValueRow({ name, value }: NameValueRowProps) {
  return (
    <tr>
      <td>
        <Tooltip title={name} placement="top-start">
          <Typography
            noWrap
            component="label"
            fontSize="sm"
            textColor="text.tertiary"
          >
            {name}
          </Typography>
        </Tooltip>
      </td>
      <td>{isString(value) ? <ValueCell>{value}</ValueCell> : value}</td>
    </tr>
  );
}

type NameValueTableProps = {
  items: NameValueItem[];
};

export type NameValueItem = [string, string | React.ReactNode];

export default function NameValueTable({ items }: NameValueTableProps) {
  return (
    <Table
      borderAxis="none"
      noWrap
      sx={{
        marginTop: '0.5rem',
        '--unstable_TableCell-height': '1rem',
        '& tr > td:nth-of-type(1)': { width: '40%' }
      }}
    >
      <tbody>
        {items.map(([name, value]) => (
          <NameValueRow key={name} name={name} value={value} />
        ))}
      </tbody>
    </Table>
  );
}
