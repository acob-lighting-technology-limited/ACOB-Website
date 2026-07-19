/**
 * Update/Blog Post Types
 *
 * Type definitions for update posts and blog content.
 */

import type { PortableTextBlock } from '@portabletext/types';
import type { SanitySlug } from './sanity.types';

// ============================================================================
// TAXONOMY TYPES
// ============================================================================

export interface Author {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: SanitySlug;
  description?: string;
}

export interface Tag {
  _id: string;
  title: string;
  slug: SanitySlug;
}

export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  shareImage?: any;
}

// ============================================================================
// UPDATE POST
// ============================================================================

/**
 * Update post (formerly blog post)
 */
export interface UpdatePost {
  /** Unique post ID */
  _id: string;
  /** Post title */
  title: string;
  /** URL slug */
  slug: SanitySlug;
  /** Post content (Portable Text) */
  content: PortableTextBlock[];
  /** Short excerpt/summary */
  excerpt: string;
  /** Publication date */
  publishedAt: string;
  /** Author name or reference */
  author: string | Author;
  /** Post primary category slug (legacy compatibility) */
  category?: string;
  /** Post categories as slug array (from GROQ projection) */
  categories: string[];
  /** Post tags as slug array (from GROQ projection) */
  tags?: string[];
  /** Featured cover image URL (legacy name, maps to coverImage) */
  featuredImage?: string;
  /** Featured cover image URL */
  coverImage?: string;
  /** SEO metadata */
  seo?: SEOMetadata;
  /** Creation timestamp */
  _createdAt: string;
  /** Last update timestamp */
  _updatedAt: string;
}

// ============================================================================
// BLOG POST (Legacy)
// ============================================================================

/**
 * Blog post (legacy structure)
 */
export interface BlogPost {
  /** Unique post ID */
  _id: string;
  /** Post title */
  title: string;
  /** URL slug */
  slug: SanitySlug;
  /** Post content (Portable Text) */
  content: PortableTextBlock[];
  /** Short excerpt/summary */
  excerpt: string;
  /** Publication date */
  publishedAt: string;
  /** Author information */
  author: {
    /** Author name */
    name: string;
    /** Author image */
    image?: any;
  };
  /** Main post image */
  mainImage?: any;
  /** Post categories */
  categories: string[];
  /** Creation timestamp */
  _createdAt: string;
  /** Last update timestamp */
  _updatedAt: string;
}
