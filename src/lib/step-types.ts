export const STEP_TYPES = [
  { id: 'extract', label: 'Extract', description: 'Pull data from a source', color: '#3b82f6' },
  { id: 'transform', label: 'Transform', description: 'Modify data shape or values', color: '#8b5cf6' },
  { id: 'load', label: 'Load', description: 'Write data to a destination', color: '#22c55e' },
  { id: 'filter', label: 'Filter', description: 'Remove rows matching criteria', color: '#f59e0b' },
  { id: 'map', label: 'Map', description: 'Apply function to each row', color: '#ec4899' },
  { id: 'aggregate', label: 'Aggregate', description: 'Group and summarize data', color: '#06b6d4' },
] as const;

export type StepType = (typeof STEP_TYPES)[number]['id'];

export function getStepType(id: string) {
  return STEP_TYPES.find((s) => s.id === id);
}

export function getStepColor(type: string): string {
  return getStepType(type)?.color ?? '#6b7280';
}
