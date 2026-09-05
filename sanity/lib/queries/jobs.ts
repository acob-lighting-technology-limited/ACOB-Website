/**
 * Job Posting Queries
 *
 * All Sanity queries related to job postings.
 * Handles fetching active job listings and counts.
 */

import { client } from '../config';
import { isDeadlineActive } from '@/lib/utils/date';

// ============================================================================
// JOB POSTING TYPE
// ============================================================================

export interface JobPosting {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  keyDuties?: string[];
  requirements: string[];
  skills?: string[];
  howToApply?: string;
  applicationDeadline?: string;
  isActive?: boolean;
  publishedAt: string;
  slug: {
    current: string;
  };
  coverImage?: {
    asset: {
      _id: string;
      url: string;
    };
    alt: string;
  };
}

// ============================================================================
// GET ACTIVE JOB POSTINGS
// ============================================================================

/**
 * Get all active job postings whose application deadline has not passed
 *
 * @returns Array of active job postings ordered by publish date
 *
 * @example
 * ```typescript
 * const jobs = await getJobPostings();
 * ```
 */
export async function getJobPostings(): Promise<JobPosting[]> {
  try {
    const jobs = await client.fetch<JobPosting[]>(`
      *[_type == "jobPosting" && isActive == true && (!defined(applicationDeadline) || dateTime(applicationDeadline + "T23:59:59Z") >= dateTime(now()))] | order(publishedAt desc) {
        _id,
        title,
        department,
        location,
        employmentType,
        description,
        keyDuties,
        requirements,
        skills,
        howToApply,
        applicationDeadline,
        isActive,
        publishedAt,
        slug,
        coverImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    `);
    return (jobs || []).filter(
      job =>
        !job.applicationDeadline || isDeadlineActive(job.applicationDeadline),
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching job postings from Sanity:', error);
    }
    return [];
  }
}

// ============================================================================
// GET SINGLE JOB POSTING
// ============================================================================

/**
 * Get a single job posting by slug
 *
 * @param slug - Job posting slug
 * @returns Job posting details or null if not found
 *
 * @example
 * ```typescript
 * const job = await getJobPosting('solar-engineer-lagos');
 * ```
 */
export async function getJobPosting(slug: string): Promise<JobPosting | null> {
  try {
    const job = await client.fetch<JobPosting | null>(
      `
      *[_type == "jobPosting" && slug.current == $slug][0] {
        _id,
        title,
        department,
        location,
        employmentType,
        description,
        keyDuties,
        requirements,
        skills,
        howToApply,
        applicationDeadline,
        isActive,
        publishedAt,
        slug,
        coverImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    `,
      { slug },
    );

    if (!job) {
      return null;
    }

    return job;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching job posting from Sanity:', error);
    }
    return null;
  }
}

// ============================================================================
// GET ACTIVE JOB COUNT
// ============================================================================

/**
 * Get count of active job postings whose application deadline has not passed
 *
 * @returns Number of active job postings
 *
 * @example
 * ```typescript
 * const count = await getActiveJobCount();
 * // 5
 * ```
 */
export async function getActiveJobCount(): Promise<number> {
  try {
    const count = await client.fetch<number>(`
      count(*[_type == "jobPosting" && isActive == true && (!defined(applicationDeadline) || dateTime(applicationDeadline + "T23:59:59Z") >= dateTime(now()))])
    `);
    return count || 0;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching job count from Sanity:', error);
    }
    return 0;
  }
}
