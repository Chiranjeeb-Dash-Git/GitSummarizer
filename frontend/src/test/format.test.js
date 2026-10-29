import { describe, expect, it } from 'vitest';
import { dayLabel, formatCompact, timeAgo } from '../lib/format.js';

describe('format', () => {
  it('compacts numbers', () => expect(formatCompact(1500)).toBe('1.5K'));
  it('labels today and yesterday', () => {
    const now = new Date('2026-10-26T12:00:00');
    expect(dayLabel('2026-10-26T08:00:00', now)).toBe('Today');
    expect(dayLabel('2026-10-25T23:00:00', now)).toBe('Yesterday');
  });
  it('says just now for tiny differences', () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 5000).toISOString(), now)).toBe('just now');
  });
});

