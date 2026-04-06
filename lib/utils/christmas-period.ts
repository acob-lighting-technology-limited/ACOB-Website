/**
 * Enables the seasonal branding only for December 2026.
 * This prevents the Christmas logo from appearing again in 2027.
 */
export function isChristmasPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so +1 for 1-12

  return year === 2026 && month === 12;
}

/**
 * Uses the temporary 2026 brand logo outside the Christmas period.
 * In 2027, the site falls back to the existing default logo set.
 */
export function isTemporary2026LogoPeriod(): boolean {
  const now = new Date();

  return now.getFullYear() === 2026 && !isChristmasPeriod();
}
