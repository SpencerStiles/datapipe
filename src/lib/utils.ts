/**
 * Translate common cron expressions into human-readable descriptions.
 * Falls back to the raw cron string with a "Custom schedule" label for
 * expressions that are not recognised.
 */
export function cronToHuman(cron: string): string {
  const trimmed = cron.trim();

  const known: Record<string, string> = {
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * 1-5': 'Weekdays at 9am',
    '*/15 * * * *': 'Every 15 minutes',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * 0': 'Weekly on Sunday',
  };

  if (known[trimmed]) {
    return known[trimmed];
  }

  return `Custom schedule: ${trimmed}`;
}
