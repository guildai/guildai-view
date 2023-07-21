import {
  CropSquareOutlined,
  GridViewOutlined,
  Insights,
  Iso,
  ViewHeadlineOutlined
} from '@mui/icons-material';

import { ToggleButtonGroup } from './components/ToggleButton';
import KeyDownBoundary from './components/KeyDownBoundary';

import { MainViewName, useMainView, filterViewForSource } from './mainView';

import { useRunsSource } from './runs';

export default function MainViewToggle() {
  const [view, setView] = useMainView();
  const [source] = useRunsSource();

  const buttons = [
    {
      value: 'grid',
      tooltip: 'Grid View (G)',
      icon: <GridViewOutlined />
    },
    {
      value: 'table',
      tooltip: 'Table View (T)',
      icon: <ViewHeadlineOutlined />
    },
    {
      value: 'run',
      tooltip: 'Run View (R)',
      icon: <CropSquareOutlined />
    },
    {
      value: 'compare',
      tooltip: 'Compare View (C)',
      icon: <Iso />
    },
    {
      value: 'summaries',
      tooltip: 'Summaries View (S)',
      icon: <Insights />
    }
  ].filter(b => filterViewForSource(b.value as MainViewName, source));

  return (
    <KeyDownBoundary navOnly>
      <ToggleButtonGroup
        buttons={buttons}
        value={view as string}
        onChange={e => setView(e.target.value as MainViewName)}
      />
    </KeyDownBoundary>
  );
}
