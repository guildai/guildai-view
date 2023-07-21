import React from 'react';

import { Input, Output, DataObject } from '@mui/icons-material';

import Labeled from './components/Labeled';
import ToggleList from './components/ToggleList';

export type FileType = 's' | 'd' | 'g';

type RunFileTypeFilterProps = {
  selected: FileType[];
  setSelected: (arg0: FileType[]) => void;
};

export default function RunFileTypeFilter({
  selected,
  setSelected
}: RunFileTypeFilterProps) {
  return (
    <Labeled label="Type" tooltip="Filter files by type">
      <ToggleList
        selected={selected}
        tooltipPlacement="bottom-start"
        onChange={e => {
          const fileType = e.target.value as FileType;
          if (e.target.checked) {
            setSelected([fileType, ...selected]);
          } else {
            setSelected(selected.filter(x => !fileType.includes(x)));
          }
        }}
        items={[
          {
            value: 's',
            tooltip: 'Source Code',
            icon: <DataObject />
          },
          {
            value: 'd',
            tooltip: 'Dependencies',
            icon: <Input />
          },
          {
            value: 'g',
            tooltip: 'Generated',
            icon: <Output />
          }
        ]}
      />
    </Labeled>
  );
}
