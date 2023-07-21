import React from 'react';

type KeyDownBoundaryProps = {
  navOnly?: boolean;
  children: React.ReactNode;
};

export default function KeyDownBoundary({
  children,
  navOnly
}: KeyDownBoundaryProps) {
  const handleKeyDown = (e: any) => {
    if (stopEvent(e, navOnly || false)) {
      e.stopPropagation();
    }
  };
  return <div onKeyDown={handleKeyDown}>{children}</div>;
}

function stopEvent(e: KeyboardEvent, navOnly: boolean): boolean {
  return !navOnly || isNavEvent(e);
}

function isNavEvent(e: KeyboardEvent): boolean {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowDown':
      return true;
    default:
      return false;
  }
}
