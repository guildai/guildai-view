import { Box } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import React from 'react';

type LazyLoadProps = {
  root: React.RefObject<HTMLElement>;
  children: (arg0: boolean) => React.ReactNode;
  sx?: SxProps;
};

export default function LazyLoad({ root, children, sx }: LazyLoadProps) {
  const [render, setRender] = React.useState<boolean>(false);
  const [visible, setVisible] = React.useState<boolean>(false);

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (root.current && ref.current) {
      const options = {
        root: root.current
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          setVisible(entry.intersectionRatio > 0);
        });
      }, options);

      observer.observe(ref.current);

      return () => observer.disconnect();
    }
  }, [root, ref, setVisible]);

  React.useEffect(() => {
    setRender(render || visible);
  }, [setRender, render, visible]);

  return <Box ref={ref} sx={sx}>{children(render)}</Box>;
}
