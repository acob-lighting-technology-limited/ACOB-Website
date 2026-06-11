/**
 * Cross-Content Search for Chatbot Queries
 *
 * When keyword-based intent detection can't classify a query (e.g. it asks
 * about a named event, partnership, or topic that isn't in the keyword lists),
 * this builds a lightweight in-memory index across ALL Sanity content
 * (updates, projects, products, jobs) and ranks items by relevance to the
 * query. This lets the bot surface published content it would otherwise miss.
 */

import type { Project, UpdatePost, Product } from '@/lib/types';

interface SanityJobPosting {
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  applicationDeadline?: string;
  description: string;
}

export interface ContentSearchInput {
  updates?: UpdatePost[];
  projects?: Project[];
  products?: Product[];
  jobs?: SanityJobPosting[];
}

export interface ContentSearchResult {
  updates: UpdatePost[];
  projects: Project[];
  products: Product[];
  jobs: SanityJobPosting[];
  /** Highest relevance score across all matched items (0 = no match) */
  topScore: number;
}

/**
 * Words that carry no topical signal. "acob" is included because nearly every
 * query mentions the company, so it must not count as a match.
 */
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'of',
  'to',
  'in',
  'on',
  'at',
  'for',
  'is',
  'are',
  'was',
  'were',
  'be',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'can',
  'could',
  'would',
  'should',
  'will',
  'i',
  'you',
  'your',
  'we',
  'our',
  'us',
  'me',
  'my',
  'it',
  'this',
  'that',
  'these',
  'those',
  'what',
  'whats',
  'who',
  'whom',
  'where',
  'when',
  'why',
  'how',
  'which',
  'tell',
  'about',
  'any',
  'some',
  'more',
  'info',
  'information',
  'please',
  'know',
  'acob',
  'lighting',
  'technology',
  'limited',
  'company',
]);

/**
 * Break text into meaningful, lowercased tokens (length >= 3, no stopwords).
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 3 && !STOPWORDS.has(token));
}

/**
 * Score how well a query matches a piece of content.
 *
 * - +2 for each distinct query token found anywhere in the haystack
 * - +5 bonus if a query token appears in the (heavily weighted) title field
 * - +8 bonus if the full multi-word query appears verbatim in the title
 */
function scoreItem(
  queryTokens: string[],
  rawQuery: string,
  title: string,
  body: string,
): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  const titleLower = title.toLowerCase();
  const haystack = `${title} ${body}`.toLowerCase();
  let score = 0;
  const seen = new Set<string>();

  for (const token of queryTokens) {
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);

    if (haystack.includes(token)) {
      score += 2;
    }
    if (titleLower.includes(token)) {
      score += 5;
    }
  }

  const normalizedQuery = rawQuery.toLowerCase().trim();
  if (normalizedQuery.length >= 3 && titleLower.includes(normalizedQuery)) {
    score += 8;
  }

  return score;
}

/** Minimum score for an item to be considered a real match. */
const MATCH_THRESHOLD = 2;

/**
 * Search across all provided content for items relevant to the query.
 * Returns the top matches per content type, ranked by relevance.
 */
export function searchContent(
  query: string,
  content: ContentSearchInput,
): ContentSearchResult {
  const queryTokens = tokenize(query);

  const result: ContentSearchResult = {
    updates: [],
    projects: [],
    products: [],
    jobs: [],
    topScore: 0,
  };

  // Empty/stopword-only queries (e.g. "hi", "what is acob") have nothing to
  // match on — let the caller fall back to a default (latest updates).
  if (queryTokens.length === 0) {
    return result;
  }

  const rankByScore = <T>(
    items: T[] | undefined,
    getTitle: (item: T) => string,
    getBody: (item: T) => string,
    limit: number,
  ): T[] => {
    if (!items?.length) {
      return [];
    }

    const scored = items
      .map(item => ({
        item,
        score: scoreItem(queryTokens, query, getTitle(item), getBody(item)),
      }))
      .filter(entry => entry.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      result.topScore = Math.max(result.topScore, scored[0].score);
    }

    return scored.slice(0, limit).map(entry => entry.item);
  };

  result.updates = rankByScore(
    content.updates,
    u => u.title ?? '',
    u =>
      [u.excerpt, u.category, u.author, ...(u.tags ?? [])]
        .filter(Boolean)
        .join(' '),
    5,
  );

  result.projects = rankByScore(
    content.projects,
    p => p.title ?? '',
    p =>
      [p.excerpt, p.description, p.category, p.location, p.state, p.lga]
        .filter(Boolean)
        .join(' '),
    5,
  );

  result.products = rankByScore(
    content.products,
    p => p.title ?? '',
    p => [p.description, p.category, p.sku].filter(Boolean).join(' '),
    8,
  );

  result.jobs = rankByScore(
    content.jobs,
    j => j.title ?? '',
    j =>
      [j.description, j.department, j.location, j.employmentType]
        .filter(Boolean)
        .join(' '),
    5,
  );

  return result;
}
