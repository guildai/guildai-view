import { Box, Stack } from '@mui/joy';

import RunSourcesPanel from './RunSourcesPanel';
import CollectionsPanel from './CollectionsPanel';

export default function PrimarySidebar() {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Stack>
        <RunSourcesPanel />
        <CollectionsPanel />
      </Stack>
    </Box>
  );
}
