/**
 * Project Types
 *
 * Type definitions for project-related data structures.
 */

import type { PortableTextBlock } from '@portabletext/types';
import type { SanitySlug } from './sanity.types';
import type { SEOMetadata } from './update.types';

// ============================================================================
// PROJECT IMPACT METRICS
// ============================================================================

/**
 * Impact metrics for a solar project
 */
export interface ProjectImpactMetrics {
  /** Kilowatt peak capacity */
  kwp?: number;
  /** Type of solar system (e.g., "Mini-Grid", "Off-Grid") */
  systemType?: string;
  /** Number of direct beneficiaries */
  beneficiaries?: number;
  /** Number of direct jobs created */
  jobsCreatedDirectly?: number;
  /** Number of indirect jobs created */
  jobsCreatedIndirectly?: number;
  /** Annual CO2 reduction in tonnes */
  annualCO2Reduction?: number;
  /** Annual energy output in kWh */
  annualEnergyOutput?: number;
  /** Battery storage capacity in kWh */
  bess?: number;
  /** Percentage of diesel generator reduction */
  dieselReduc?: number;
  /** Percentage of operational energy cost savings */
  costSavings?: number;
  /** Percentage of patient care increment */
  patientCareInc?: number;
  /** Percentage of system energy uptime */
  uptime?: number;
}

// ============================================================================
// PROJECT CONTENT
// ============================================================================

/**
 * Structured content block for a project (description template + media)
 */
export interface ProjectContent {
  /** Description template name (e.g., 'description1', 'custom') */
  template?: string;
  /** Description template name (alias used by components) */
  description?: string;
  /** Raw custom narrative text */
  narrative?: string;
  /** Custom description text (alias used by components) */
  customDescription?: string;
  /** Portable Text body */
  body?: PortableTextBlock[];
  /** Images and videos attached to this content block */
  images?: Array<{
    _type?: string;
    asset: {
      url: string;
      metadata?: { dimensions?: { width?: number; height?: number } };
    };
    alt?: string;
    title?: string;
  }>;
}

// ============================================================================
// PROJECT COMMENT
// ============================================================================

/**
 * Comment on a project
 */
export interface ProjectComment {
  /** Unique key for the comment */
  _key: string;
  /** Comment author name */
  author: string;
  /** Author email */
  email: string;
  /** Comment text content */
  commentContent: string;
  /** Comment creation date */
  createdAt: string;
  /** Whether comment is approved for display */
  isApproved: boolean;
}

// ============================================================================
// PROJECT
// ============================================================================

/**
 * Solar project
 */
export interface Project {
  /** Unique project ID */
  _id: string;
  /** Project title */
  title: string;
  /** Short excerpt/summary */
  excerpt?: string;
  /** URL slug */
  slug: SanitySlug;
  /** Project categories (referenced dynamic categories) */
  categories: string[];
  /** Primary category slug (legacy single-value shortcut) */
  category?: string;
  /** Sub-category within one of the categories (e.g., "isolated", "residential") */
  subcategory?: string;
  /** Project completion/start date */
  publishedAt?: string;
  /** Legacy projectDate for compatibility */
  projectDate?: string;
  /** Legacy projectImage for compatibility */
  projectImage?: string;
  /** Legacy description field (use excerpt instead) */
  description?: string;
  /** Description template name (e.g., 'description1', 'custom') */
  descriptionTemplate?: string;
  /** Structured project content (description + media) */
  projectContent?: ProjectContent;
  /** Custom description narrative (Portable Text) */
  content?: PortableTextBlock[];
  /** Project images and videos gallery */
  gallery?: Array<{
    _type?: string;
    asset: { url: string };
    alt?: string;
    title?: string;
  }>;
  /** Project location (city/area) */
  location: string;
  /** Local Government Area */
  lga?: string;
  /** Nigerian state */
  state?: string;
  /** Latitude for the homepage map marker */
  latitude?: number;
  /** Longitude for the homepage map marker */
  longitude?: number;
  /** Main project cover image URL */
  coverImage?: string;
  /** Whether project is featured */
  isFeatured?: boolean;
  /** Featured ranking (lower = higher priority) */
  featuredRank?: number;
  /** Project impact metrics */
  impactMetrics?: ProjectImpactMetrics;
  /** Custom metrics specific to this project */
  customMetrics?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  /** Project comments */
  comments?: ProjectComment[];
  /** SEO settings */
  seo?: SEOMetadata;
  /** Creation timestamp */
  _createdAt: string;
  /** Last update timestamp */
  _updatedAt: string;
}
