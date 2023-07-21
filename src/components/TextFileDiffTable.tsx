import { Table } from '@mui/joy';

import { DiffLine, FileDiff } from '../types';

type DiffRowFragmentProps = {
  line: number | null;
  diffText: string;
  change: string | false;
};

function DiffRowFragment({ line, diffText, change }: DiffRowFragmentProps) {
  if (!change || line === null) {
    return (
      <>
        <td>{line}</td>
        <td></td>
        <td>
          <span style={{ whiteSpace: 'pre' }}>{diffText}</span>
        </td>
      </>
    );
  }

  const [, formattedDiffText] = formatDiffText(diffText);
  const changeClass = classForChange(change);
  return (
    <>
      <td className={`line ${changeClass}`}>{line}</td>
      <td className={changeClass}>{change}</td>
      <td className={changeClass}>
        <span style={{ whiteSpace: 'pre' }}>{formattedDiffText}</span>
      </td>
    </>
  );
}

function classForChange(change: string | false): string | undefined {
  switch (change) {
    case '+':
      return 'add';
    case '-':
      return 'del';
    case '^':
      return 'chg';
    default:
      return undefined;
  }
}

function formatDiffText(diffText: string): [string | false, React.ReactNode] {
  const tokens = splitDiffText(diffText);
  if (tokens.length === 1) {
    return formatToken(tokens[0]);
  }
  return [false, tokens.map((t, i) => formatChange(formatToken(t), i))];
}

function formatToken(token: string): [string | false, string] {
  if (token[0] === '\x00' && token.slice(-1, token.length) === '\x01') {
    return [token[1], token.slice(2, -1)];
  }
  return [false, token];
}

function formatChange(
  [change, text]: [string | false, string],
  i: number
): React.ReactNode {
  return change ? (
    <span key={`change-${i}`} className={classForChange(change)}>
      {text}
    </span>
  ) : (
    text
  );
}

function splitDiffText(s: string): string[] {
  // eslint-disable-next-line no-control-regex
  return [...s.split(/(\x00[-+^].+?\x01)/g)];
}

type DiffRowProps = {
  line: DiffLine;
};

function DiffRow({ line }: DiffRowProps) {
  const [[lhsLine, lhsText], [rhsLine, rhsText], changed] = line;

  return (
    <tr>
      <DiffRowFragment
        line={lhsLine}
        diffText={lhsText}
        change={changed && '-'}
      />
      <DiffRowFragment
        line={rhsLine}
        diffText={rhsText}
        change={changed && '+'}
      />
    </tr>
  );
}

type TextFileDiffTableProps = {
  diff: FileDiff | undefined;
};

export default function TextFileDiffTable({ diff }: TextFileDiffTableProps) {
  const lineColWidth = calcLineColWidth(diff);

  const tableStyles = {
    fontFamily: 'monospace',
    '--TableCell-height': '1rem',
    '--TableCell-paddingY': 0,
    '--TableCell-paddingX': 0,
    '& td': {
      lineHeight: 1.7,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  };

  const changeStyles = {
    '& td.add': {
      bgcolor: 'success.plainActiveBg',
      filter: 'saturate(0.5)'
    },
    '& td span.add': {
      bgcolor: 'success.500'
    },
    '& td.add span.chg': {
      bgcolor: 'success.500'
    },
    '& td.line.add': {
      bgcolor: 'success.plainHoverBg'
    },
    '& td.del': {
      bgcolor: 'danger.plainActiveBg',
      filter: 'saturate(0.5)'
    },
    '& td span.del': {
      bgcolor: 'danger.plainHoverBg'
    },
    '& td.del span.chg': {
      bgcolor: 'danger.plainHoverBg'
    },
    '& td.line.del': {
      bgcolor: 'danger.plainHoverBg'
    }
  };

  const lineColStyles = {
    width: lineColWidth,
    color: 'text.tertiary',
    textAlign: 'right',
    verticalAlign: 'top',
    padding: '0 1em 0 0'
  };

  const changeColStyles = {
    width: '1.5em',
    textAlign: 'center',
    verticalAlign: 'top'
  };

  const textColStyles = {
    width: '50%',
    padding: '0 0.5em'
  };

  const colStyles = {
    '& td:nth-of-type(1)': lineColStyles,
    '& td:nth-of-type(2)': changeColStyles,
    '& td:nth-of-type(3)': textColStyles,
    '& td:nth-of-type(4)': lineColStyles,
    '& td:nth-of-type(5)': changeColStyles,
    '& td:nth-of-type(6)': textColStyles
  };

  return diff && diff.lines ? (
    <Table
      size="sm"
      borderAxis="none"
      sx={{ ...tableStyles, ...colStyles, ...changeStyles }}
    >
      <tbody>
        {diff.lines.map((line, i) => (
          <DiffRow key={`row-${i}`} line={line} />
        ))}
      </tbody>
    </Table>
  ) : (
    <></>
  );
}

function calcLineColWidth(diff: FileDiff | undefined): string {
  const maxLineCount = diff
    ? Math.max(diff.lhsLineCount || 0, diff.rhsLineCount || 0)
    : 0;
  const digits = Math.floor(Math.log10(maxLineCount) + 1);
  return `${digits * 0.75 + 1.5}em`;
}
