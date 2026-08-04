/**
 * Project category taxonomy
 *
 * `categories` on a project is a multi-select array (see sanity/schemaTypes/project.ts),
 * so a project can belong to more than one category — e.g. a mini-grid in a
 * rural community is tagged both "rural-electrification" and "mini-grids".
 * Each URL slug below maps 1:1 to a real category tag value; this file is
 * the single source of truth for display info, shared by the category page
 * and the category/sub-category page.
 */

export interface CategoryInfo {
  title: string;
  description: string;
  fallbackImage: string;
}

export const CATEGORY_INFO: Record<string, CategoryInfo> = {
  'rural-electrification': {
    title: 'Rural Electrification',
    description: 'Bringing reliable power to remote communities across Nigeria',
    fallbackImage: '/images/adebayo-community.webp?height=400&width=1200',
  },
  'mini-grids': {
    title: 'Mini-Grids',
    description:
      'Community solar mini-grid systems — isolated and interconnected',
    fallbackImage: '/images/adebayo-community.webp?height=400&width=1200',
  },
  'commercial-installations': {
    title: 'Commercial Installations',
    description: 'Solar solutions for businesses and commercial establishments',
    fallbackImage: '/images/airport-road-abuja.webp?height=400&width=1200',
  },
  'street-lighting': {
    title: 'Street Lighting',
    description:
      'Public lighting infrastructure projects for safer communities',
    fallbackImage:
      '/images/projects/installation-high-density-streetlight-1.webp?height=400&width=1200',
  },
  'healthcare-projects': {
    title: 'Healthcare Projects',
    description:
      'Powering hospitals and healthcare facilities with reliable energy',
    fallbackImage:
      '/images/projects/keffi-nassarawa-hospital-1.webp?height=400&width=1200',
  },
  pue: {
    title: 'Productive Use of Energy (PUE)',
    description:
      'Powering income-generating activities — EV charging, irrigation, and CNG',
    fallbackImage: '/images/adebayo-community.webp?height=400&width=1200',
  },
};

export interface SubcategoryInfo {
  title: string;
  description: string;
}

/** Sub-category display info, keyed by the Sanity `subcategory` value. */
export const SUBCATEGORY_INFO: Record<string, SubcategoryInfo> = {
  isolated: {
    title: 'Isolated',
    description: 'Standalone off-grid mini-grid systems',
  },
  interconnected: {
    title: 'Interconnected',
    description: 'Mini-grids connected to the national grid',
  },
  residential: {
    title: 'Residential',
    description: 'Solar installations for homes and residential estates',
  },
  commercial: {
    title: 'Commercial',
    description: 'Solar installations for businesses and offices',
  },
  primary: {
    title: 'Primary Healthcare',
    description: 'Clinics and primary health centres',
  },
  secondary: {
    title: 'Secondary Healthcare',
    description: 'General and referral hospitals',
  },
  tertiary: {
    title: 'Tertiary Healthcare',
    description: 'Teaching and specialist hospitals',
  },
  'ev-charging': {
    title: 'EV Charging',
    description: 'Electric vehicle charging stations',
  },
  irrigation: {
    title: 'Irrigation',
    description: 'Solar-powered irrigation systems',
  },
  cng: {
    title: 'CNG',
    description: 'Compressed natural gas solutions',
  },
};
