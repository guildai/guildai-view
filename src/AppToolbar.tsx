import React from 'react';

import { Divider } from '@mui/joy';

import { RefreshOutlined, SettingsOutlined } from '@mui/icons-material';

import ToolbarButton from './components/ToolbarButton';

import AppMenubar from './AppMenubar';

import { dispatchKeyDownEvent } from './utils';
import { darkMode } from './prefs';

import logoWhite from './logo-white.png';
import logoBlue from './logo-blue.png';

function Logo() {
  return (
    <img
      src={darkMode ? logoWhite : logoBlue}
      style={{ maxHeight: '22px', margin: '0 0.5rem 0 0.5rem' }}
      alt="Guild AI"
    />
  );
}

function RefreshButton() {
  return (
    <ToolbarButton
      tooltip="Refresh (Shift+R)"
      onClick={() => dispatchKeyDownEvent('R', {shiftKey: true})}
      icon={<RefreshOutlined />}
    />
  );
}

function SettingsButton() {
  return (
    <ToolbarButton
      tooltip="Settings"
      onClick={() => console.log('TODO: open settings dialog')}
      icon={<SettingsOutlined />}
    />
  );
}

export default function AppToolbar() {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      <div
        style={{
          display: 'flex',
          alignSelf: 'center',
          alignItems: 'center',
          gap: '0.75em'
        }}
      >
        <Logo />
        <AppMenubar />
        <Divider orientation="vertical" />
        <RefreshButton />
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 0
        }}
      >
        <SettingsButton />
      </div>
    </div>
  );
}
