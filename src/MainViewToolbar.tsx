import React from 'react';

import MainViewToggle from './MainViewToggle';

type MainViewToolbarProps = {
  endDecorator?: React.ReactNode;
};

export default function MainViewToolbar({
  endDecorator
}: MainViewToolbarProps) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignSelf: 'center' }}>
        <MainViewToggle />
      </div>
      <div style={{ flex: 1 }} />
      {endDecorator && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 0
          }}
        >
          {endDecorator}
        </div>
      )}
    </div>
  );
}
