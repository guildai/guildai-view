import { Run } from './types';

export function DeletedRunAttr({ value }: { value: any }) {
  return (
    <span
      style={{
        textDecoration: 'line-through',
        color: 'var(--joy-palette-text-tertiary'
      }}
    >
      {value}
    </span>
  );
}

export default function RunOperationLabel({ run }: { run: Run }) {
  return run.deleted ? (
    <DeletedRunAttr value={run.operation} />
  ) : (
    <span>{run.operation}</span>
  );
}
