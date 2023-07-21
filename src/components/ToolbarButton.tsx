import { IconButton, Typography } from '@mui/joy';

import Tooltip from './Tooltip';

type ToolbarButtonProps = {
  label?: string;
  icon?: React.ReactElement;
  tooltip?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  selected?: boolean;
  color?: 'danger' | 'neutral' | 'warning' | 'info' | 'primary';
  variant?: 'plain' | 'soft' | 'outlined' | 'solid';
};

export default function ToolbarButton({
  label,
  icon,
  disabled,
  selected,
  onClick,
  tooltip,
  color,
  variant
}: ToolbarButtonProps) {
  const button = (
    <IconButton
      size="sm"
      color={color || 'neutral'}
      variant={variant || selected ? 'soft' : 'plain'}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label ? (
        <Typography
          level="body2"
          sx={{
            mx: 1,
            color: disabled
              ? 'text.tertiary'
              : selected
              ? 'text.primary'
              : 'text.secondary',
            opacity: disabled ? 0.3 : 1.0
          }}
        >
          {label}
        </Typography>
      ) : (
        <></>
      )}
    </IconButton>
  );
  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
}
