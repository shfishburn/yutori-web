import { describe, expect, it } from 'vitest';
import {
  computeStreak,
  computeWeeklyBuckets,
  sanitizeLimit,
  sanitizeOffset,
  type SessionSummary,
} from './sessions';

function makeSession(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: overrides.id ?? 'session-1',
    sessionType: overrides.sessionType ?? 'sauna',
    startedAt: overrides.startedAt ?? '2026-02-21T10:00:00Z',
    endedAt: overrides.endedAt ?? '2026-02-21T10:20:00Z',
    durationMs: overrides.durationMs ?? 1_200_000,
    peakTempC: overrides.peakTempC ?? 82,
    minTempC: overrides.minTempC ?? null,
    avgHumidityPct: overrides.avgHumidityPct ?? 28,
    peakHumidityPct: overrides.peakHumidityPct ?? 35,
    hrvTrend: overrides.hrvTrend ?? null,
    totalKcal: overrides.totalKcal ?? null,
    calorieConfidence: overrides.calorieConfidence ?? null,
    rltActive: overrides.rltActive ?? false,
    contrastId: overrides.contrastId ?? null,
    splitIndex: overrides.splitIndex ?? 0,
    aiInsight: overrides.aiInsight ?? null,
    safetyWarningCount: overrides.safetyWarningCount ?? 0,
  };
}

function mondayUtcKey(date: Date): string {
  const copy = new Date(date);
  const day = copy.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + diff);
  copy.setUTCHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

describe('computeStreak', () => {
  it('uses UTC completion day from endedAt', () => {
    const sessions = [
      makeSession({
        startedAt: '2026-02-21T18:00:00Z',
        endedAt: '2026-02-22T00:30:00+05:00',
      }),
    ];

    const now = new Date('2026-02-21T12:00:00Z');
    expect(computeStreak(sessions, now)).toBe(1);
  });

  it('continues streak from yesterday when today has no session yet', () => {
    const sessions = [
      makeSession({ id: 's1', endedAt: '2026-02-21T08:30:00Z' }),
      makeSession({ id: 's2', endedAt: '2026-02-20T07:45:00Z' }),
    ];

    const now = new Date('2026-02-22T12:00:00Z');
    expect(computeStreak(sessions, now)).toBe(2);
  });
});

describe('computeWeeklyBuckets', () => {
  it('buckets by completion week (endedAt), not startedAt', () => {
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - 8 * 86_400_000);
    const sessions = [
      makeSession({
        id: 's1',
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      }),
    ];

    const buckets = computeWeeklyBuckets(sessions);
    const endedWeek = buckets.find((b) => b.weekStart === mondayUtcKey(endedAt));
    const startedWeek = buckets.find((b) => b.weekStart === mondayUtcKey(startedAt));

    expect(endedWeek?.totalCount).toBe(1);
    if (startedWeek && startedWeek.weekStart !== endedWeek?.weekStart) {
      expect(startedWeek.totalCount).toBe(0);
    }
  });
});

describe('session history input sanitization', () => {
  it('clamps and defaults limit defensively', () => {
    expect(sanitizeLimit(undefined)).toBe(50);
    expect(sanitizeLimit(Number.NaN)).toBe(50);
    expect(sanitizeLimit(0)).toBe(50);
    expect(sanitizeLimit(-3)).toBe(50);
    expect(sanitizeLimit(120)).toBe(100);
    expect(sanitizeLimit(12.9)).toBe(12);
  });

  it('clamps and defaults offset defensively', () => {
    expect(sanitizeOffset(undefined)).toBe(0);
    expect(sanitizeOffset(Number.NaN)).toBe(0);
    expect(sanitizeOffset(-5)).toBe(0);
    expect(sanitizeOffset(17.8)).toBe(17);
  });
});
