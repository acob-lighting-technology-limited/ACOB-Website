/**
 * Type Definitions - Central Barrel Export
 *
 * Re-exports all domain type modules from lib/types/*. Import from here
 * for convenience, or from a specific domain module (e.g. lib/types/project.types)
 * when you only need one domain's types.
 */

export * from './types/index';

// Also export Portable Text types for convenience
export type { PortableTextBlock } from '@portabletext/types';
