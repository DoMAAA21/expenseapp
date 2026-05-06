import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRollingMonthPeriods } from '../hooks/use-recent-monthly-summaries';

describe('getRollingMonthPeriods', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns months in oldest-to-newest order', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));

    const periods = getRollingMonthPeriods(3);

    expect(periods).toHaveLength(3);
    expect(periods.map((p) => [p.year, p.month])).toEqual([
      [2026, 3],
      [2026, 4],
      [2026, 5],
    ]);
  });

  it('handles year boundaries correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));

    const periods = getRollingMonthPeriods(3);

    expect(periods.map((p) => [p.year, p.month])).toEqual([
      [2025, 11],
      [2025, 12],
      [2026, 1],
    ]);
  });
});
