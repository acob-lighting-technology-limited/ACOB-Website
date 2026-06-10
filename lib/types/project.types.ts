/**
 * Project Types
 *
 * Type definitions for project-related data structures.
 */

import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImage, SanitySlug } from './sanity.types';

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
}

// ============================================================================
// PROJECT CONTENT
// ============================================================================

/**
 * Project content structure (new format)
 */
export interface ProjectContent {
  /** Description type selector */
  description?:
    | 'description1'
    | 'description2'
    | 'description3'
    | 'description4'
    | 'description5'
    | 'description6'
    | 'description7'
    | 'custom';
  /** Custom description using Portable Text */
  customDescription?: PortableTextBlock[];
  /** Project images */
  images?: Array<{
    _type?: string;
    asset: { url: string };
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
  /** Full description */
  description?: string;
  /** URL slug */
  slug: SanitySlug;
  /** Project category (e.g., "Mini-Grid", "Street Lighting") */
  category: string;
  /** Project completion/start date */
  projectDate?: string;
  /** Legacy content (Portable Text) - will be deprecated */
  content?: PortableTextBlock[];
  /** New structured content */
  projectContent?: ProjectContent;
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
  /** Main project image URL */
  projectImage: string;
  /** Sanity image references (for compatibility) */
  images?: SanityImage[];
  /** Gallery images extracted from content */
  galleryImages?: string[];
  /** Whether project is featured */
  isFeatured?: boolean;
  /** Featured ranking (lower = higher priority) */
  featuredRank?: number;
  /** Project impact metrics */
  impactMetrics?: ProjectImpactMetrics;
  /** Project comments */
  comments?: ProjectComment[];
  /** Creation timestamp */
  _createdAt: string;
  /** Last update timestamp */
  _updatedAt: string;
}
