import {
  formatDate,
  formatDateTime,
  getRelativeTime,
  getCurrentDate,
  isDeadlineActive,
  isDeadlinePassed,
} from '../date';

describe('formatDate', () => {
  it('formats an ISO date string as DD/MM/YYYY', () => {
    expect(formatDate('2026-03-05T00:00:00.000Z')).toBe('05/03/2026');
  });

  it('pads single-digit day and month', () => {
    expect(formatDate('2026-01-09T00:00:00.000Z')).toBe('09/01/2026');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO date string as DD/MM/YYYY HH:MM', () => {
    const result = formatDateTime('2026-03-05T14:30:00.000Z');
    expect(result).toMatch(/^05\/03\/2026 \d{2}:\d{2}$/);
  });
});

describe('getRelativeTime', () => {
  it('returns "Today" for the current date', () => {
    expect(getRelativeTime(new Date().toISOString())).toBe('Today');
  });

  it('returns "Yesterday" for one day ago', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getRelativeTime(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns days ago for recent dates under a week', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(getRelativeTime(threeDaysAgo.toISOString())).toBe('3 days ago');
  });

  it('returns weeks ago for dates under a month', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(getRelativeTime(twoWeeksAgo.toISOString())).toBe('2 weeks ago');
  });
});

describe('getCurrentDate', () => {
  it('returns today in DD/MM/YYYY format', () => {
    expect(getCurrentDate()).toBe(formatDate(new Date().toISOString()));
  });
});

describe('isDeadlineActive & isDeadlinePassed', () => {
  it('treats undefined or null deadline as active', () => {
    expect(isDeadlineActive(null)).toBe(true);
    expect(isDeadlineActive(undefined)).toBe(true);
    expect(isDeadlinePassed(null)).toBe(false);
    expect(isDeadlinePassed(undefined)).toBe(false);
  });

  it('returns active for future deadlines', () => {
    const futureDate = '2099-12-31';
    expect(isDeadlineActive(futureDate)).toBe(true);
    expect(isDeadlinePassed(futureDate)).toBe(false);
  });

  it('returns passed for past deadlines', () => {
    const pastDate = '2020-01-01';
    expect(isDeadlineActive(pastDate)).toBe(false);
    expect(isDeadlinePassed(pastDate)).toBe(true);
  });
});
