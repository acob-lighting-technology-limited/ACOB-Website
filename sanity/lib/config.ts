/**
 * Sanity Client Configuration
 *
 * Base Sanity client setup for server and browser environments.
 * Import this client in query files to execute GROQ queries.
 */

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const projectId = requireEnv(
  process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
);

const dataset = requireEnv(
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  'NEXT_PUBLIC_SANITY_DATASET',
);

const token = process.env.SANITY_API_TOKEN?.trim() || undefined;

// ============================================================================
// VALIDATION
// ============================================================================

if (!token) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Sanity API token not found. Some features may not work properly.',
    );
  }
}

// ============================================================================
// CLIENT INSTANCES
// ============================================================================

/**
 * Server-side Sanity client (READ-OPTIMIZED)
 *
 * Use this client for:
 * - API routes (read operations)
 * - Server-side rendering (SSR)
 * - Server components
 *
 * Features:
 * - CDN enabled in production for faster, free reads
 * - No token (CDN reads don't need authentication)
 * - Dramatically reduces API quota usage
 */
export const client = createClient({
  projectId,
  dataset,
  // CDN is free, fast, and doesn't count toward API quota.
  // Always use CDN for read operations in production.
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2025-07-16',
  // No token for read-only CDN queries — token disables CDN caching
});

/**
 * Server-side Sanity client (WRITE/MUTATION)
 *
 * Use this client ONLY for:
 * - Write operations (patch, create, delete)
 * - Webhook handlers
 * - SharePoint backup mutations
 *
 * This client bypasses CDN because authenticated requests require it.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2025-07-16',
  token: token,
});

/**
 * Browser-side Sanity client
 *
 * Use this client for:
 * - Client-side data fetching (use sparingly)
 * - Real-time subscriptions
 *
 * Features:
 * - No API token (read-only)
 * - CDN always enabled
 * - For security, prefer using API routes instead
 */
export const clientForBrowser = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: '2025-07-16',
  // No token for client-side requests (security)
});

// ============================================================================
// IMAGE URL BUILDER
// ============================================================================

const builder = imageUrlBuilder(client);

/**
 * Generate optimized image URLs from Sanity image references
 *
 * @param source - Sanity image reference
 * @returns Image URL builder instance
 *
 * @example
 * ```typescript
 * const imageUrl = urlFor(image)
 *   .width(800)
 *   .height(600)
 *   .quality(85)
 *   .url();
 * ```
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion: '2025-07-16',
} as const;
