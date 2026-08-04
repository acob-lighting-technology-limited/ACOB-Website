import {
  isChristmasPeriod,
  isTemporary2026LogoPeriod,
} from '../christmas-period';

describe('isChristmasPeriod', () => {
  const RealDate = Date;

  afterEach(() => {
    global.Date = RealDate;
  });

  function mockDate(isoString: string) {
    class MockDate extends RealDate {
      constructor() {
        super();
        return new RealDate(isoString);
      }
    }
    // @ts-expect-error - test-only Date mock
    global.Date = MockDate;
  }

  it('is true in December 2026', () => {
    mockDate('2026-12-15T00:00:00.000Z');
    expect(isChristmasPeriod()).toBe(true);
  });

  it('is false in November 2026', () => {
    mockDate('2026-11-15T00:00:00.000Z');
    expect(isChristmasPeriod()).toBe(false);
  });

  it('is false in December 2027 (does not recur)', () => {
    mockDate('2027-12-15T00:00:00.000Z');
    expect(isChristmasPeriod()).toBe(false);
  });

  it('temporary 2026 logo period is true outside December 2026 but within 2026', () => {
    mockDate('2026-06-01T00:00:00.000Z');
    expect(isTemporary2026LogoPeriod()).toBe(true);
    expect(isChristmasPeriod()).toBe(false);
  });

  it('temporary 2026 logo period is false during Christmas period itself', () => {
    mockDate('2026-12-15T00:00:00.000Z');
    expect(isTemporary2026LogoPeriod()).toBe(false);
  });

  it('temporary 2026 logo period is false in 2027', () => {
    mockDate('2027-01-15T00:00:00.000Z');
    expect(isTemporary2026LogoPeriod()).toBe(false);
  });
});
