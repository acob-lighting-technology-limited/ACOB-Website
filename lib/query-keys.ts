export const QUERY_KEYS = {
  updates: (filters?: Record<string, unknown>) =>
    filters ? ['updates', filters] : ['updates'],
  update: (slug: string) => ['update', slug],
  projects: (filters?: Record<string, unknown>) =>
    filters ? ['projects', filters] : ['projects'],
  project: (slug: string) => ['project', slug],
  products: (filters?: Record<string, unknown>) =>
    filters ? ['products', filters] : ['products'],
  product: (slug: string) => ['product', slug],
  jobPostings: () => ['jobPostings'],
  jobPosting: (slug: string) => ['jobPosting', slug],
  comments: (postId: string) => ['comments', postId],
} as const;
