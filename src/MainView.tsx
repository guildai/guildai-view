import React from 'react';

import { Box } from '@mui/joy';

import CompareView from './CompareView';
import GridView from './GridView';
import RunView from './RunView';
import SummariesView from './SummariesView';
import TableView from './TableView';

import { useMainView } from './mainView';
import { SxProps } from '@mui/joy/styles/types';
import { Conditional2 } from './components/Conditional';

type MainViewHeaderProps = {
  children?: React.ReactNode;
  sx?: SxProps;
};

export function MainViewHeader({ children, sx }: MainViewHeaderProps) {
  return (
    <Box
      sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 1, ...sx }}
    >
      {children}
    </Box>
  );
}

type MainViewContentProps = {
  ref?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
};

export const MainViewContent = React.forwardRef(
  ({ children }: MainViewContentProps, ref) => {
    return (
      <Box ref={ref} sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </Box>
    );
  }
);

type MainViewFooterProps = {
  children: React.ReactNode;
};

export function MainViewFooter({ children }: MainViewFooterProps) {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1 }}>
      {children}
    </Box>
  );
}

type ConditionalViewProps = {
  name: string;
  children: () => React.ReactNode;
};

function ConditionalView({ name, children }: ConditionalViewProps) {
  const [current] = useMainView();

  return (
    <Conditional2
      active={name === current}
      children={children}
      sx={{ display: 'flex', flexFlow: 'column', height: '100%' }}
    />
  );
}

export default function MainView() {
  return (
    <>
      <ConditionalView name="grid" children={() => <GridView />} />
      <ConditionalView name="table" children={() => <TableView />} />
      <ConditionalView name="run" children={() => <RunView />} />
      <ConditionalView name="run" children={() => <RunView />} />
      <ConditionalView name="compare" children={() => <CompareView />} />
      <ConditionalView name="summaries" children={() => <SummariesView />} />
    </>
  );
}
