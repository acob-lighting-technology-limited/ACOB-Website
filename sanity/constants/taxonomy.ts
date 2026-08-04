/**
 * Sanity Taxonomy Constants
 *
 * Single source of truth for all predefined categories.
 * To add a new category: add an entry here and redeploy — no Sanity Studio editing needed.
 *
 * Tags are intentionally free-form and NOT defined here.
 */

// ============================================================================
// PROJECT CATEGORIES
// These match the slugs in lib/constants/project-categories.ts
// ============================================================================

export const PROJECT_CATEGORY_OPTIONS = [
  { title: 'Rural Electrification', value: 'rural-electrification' },
  { title: 'Mini-Grids', value: 'mini-grids' },
  { title: 'Commercial Installations', value: 'commercial-installations' },
  { title: 'Street Lighting', value: 'street-lighting' },
  { title: 'Healthcare Projects', value: 'healthcare-projects' },
  { title: 'Productive Use of Energy (PUE)', value: 'pue' },
] as const;

export type ProjectCategoryValue =
  (typeof PROJECT_CATEGORY_OPTIONS)[number]['value'];

// ============================================================================
// UPDATE POST CATEGORIES
// These match the hrefs in the "Updates & Media" nav section (navigation-data.ts)
// ============================================================================

export const UPDATE_CATEGORY_OPTIONS = [
  { title: 'Announcements', value: 'announcements' },
  { title: 'Case Studies', value: 'case-studies' },
  { title: 'Press Releases', value: 'press-releases' },
  { title: 'Events', value: 'events' },
  { title: 'Celebrations', value: 'celebrations' },
] as const;

export type UpdateCategoryValue =
  (typeof UPDATE_CATEGORY_OPTIONS)[number]['value'];
