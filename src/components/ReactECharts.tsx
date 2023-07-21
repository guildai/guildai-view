// Credit: https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-optimizing-bundle-size-29l8

import React from 'react';

import { getInstanceByDom, init } from 'echarts';

import type { EChartsOption, ECharts, SetOptionOpts } from 'echarts';

export { EChartsOption };

type EventHandler = (params: any) => void;

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: 'light' | 'dark';
  zoomOnce?: boolean;
  onClick?: EventHandler;
  onMouseOver?: EventHandler;
  onMouseOut?: EventHandler;
}

function useChartInit(
  ref: React.RefObject<HTMLDivElement>,
  theme?: 'dark' | 'light'
) {
  React.useEffect(() => {
    let chart: ECharts | undefined;

    if (ready(ref)) {
      chart = init(ref.current!, theme);
    }

    function resizeChart() {
      chart?.resize();
    }
    window.addEventListener('resize', resizeChart);

    return () => {
      chart?.dispose();
      window.removeEventListener('resize', resizeChart);
    };
  }, [ref, theme]);
}

function useChartConfig(
  ref: React.RefObject<HTMLDivElement>,
  option: EChartsOption,
  settings?: SetOptionOpts
) {
  React.useEffect(() => {
    if (ready(ref)) {
      const chart = getInstanceByDom(ref.current!);
      chart?.setOption(option, settings);
    }
  }, [ref, option, settings]);
}

function useChartLoading(
  ref: React.RefObject<HTMLDivElement>,
  loading?: boolean
) {
  React.useEffect(() => {
    if (ready(ref)) {
      const chart = getInstanceByDom(ref.current!);
      if (loading === true) {
        chart?.showLoading();
      } else {
        chart?.hideLoading();
      }
    }
  }, [ref, loading]);
}

function useChartEvents(
  ref: React.RefObject<HTMLDivElement>,
  onClick?: EventHandler,
  onMouseOver?: EventHandler,
  onMouseOut?: EventHandler,
  zoomOnce?: boolean
) {
  React.useEffect(() => {
    if (ready(ref)) {
      const chart = getInstanceByDom(ref.current!);
      if (onClick) {
        chart?.off('click');
        chart?.on('click', onClick);
      }
      if (onMouseOver) {
        chart?.off('mouseover');
        chart?.on('mouseover', onMouseOver);
      }
      if (onMouseOut) {
        chart?.off('mouseout');
        chart?.on('mouseout', onMouseOut);
      }
      if (zoomOnce) {
        chart?.off('datazoom');
        chart?.on('datazoom', (params: any) => {
          chart.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'dataZoomSelect',
            dataZoomSelectActive: false
          });
        });
      }
    }
  }, [ref, onClick, onMouseOver, onMouseOut, zoomOnce]);
}

function ready(ref: React.RefObject<HTMLDivElement>) {
  return ref.current !== null && ref.current.offsetParent !== null;
}

export function ReactECharts({
  option,
  style,
  settings,
  loading,
  theme,
  zoomOnce,
  onClick,
  onMouseOver,
  onMouseOut
}: ReactEChartsProps): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);

  useChartInit(ref, theme);
  useChartConfig(ref, option, settings);
  useChartLoading(ref, loading);
  useChartEvents(ref, onClick, onMouseOver, onMouseOut, zoomOnce);

  return <div ref={ref} style={style} />;
}
