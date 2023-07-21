import { Tooltip as BaseTooltip, TooltipProps } from '@mui/joy';

export type TooltipPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top'
  | undefined;

export default function Tooltip({
  title,
  placement,
  children,
  sx
}: TooltipProps) {
  return (
    <BaseTooltip
      title={title}
      placement={placement}
      size="sm"
      enterDelay={700}
      enterNextDelay={700}
      sx={sx}
    >
      {children}
    </BaseTooltip>
  );
}
