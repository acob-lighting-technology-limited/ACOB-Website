import { Suspense } from 'react';
import { UpdatesGridSkeleton } from '@/components/ui/updates-grid-skeleton';
import { getUpdatePostsPaginated } from '@/sanity/lib/queries';
import type { UpdatePost } from '@/lib/types';
import CategoryUpdatesClient from './category-updates-client';

interface CategoryUpdatesPageProps {
  category: string;
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
}

export async function CategoryUpdatesPage({
  category,
  searchParams,
}: CategoryUpdatesPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const limit = 9;

  // Format category name for display
  const categoryTitle = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Fetch all posts for this category
  const allCategoryPosts = await getUpdatePostsPaginated({
    page: 1,
    limit: 1000, // Get all posts to filter by category
    search: '',
  });

  // Filter posts by category
  const categoryPosts = allCategoryPosts.posts.filter(
    (post: UpdatePost) => post.category === category,
  );

  // Apply search filter if provided
  const searchFilteredPosts = search
    ? categoryPosts.filter(
        (post: UpdatePost) =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(search.toLowerCase()),
      )
    : categoryPosts;

  // Calculate pagination for category posts
  const totalPosts = searchFilteredPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = searchFilteredPosts.slice(startIndex, endIndex);

  const pagination = {
    currentPage: page,
    totalPages,
    totalCount: totalPosts,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Updates', href: '/updates' },
    { label: categoryTitle },
  ];

  return (
    <Suspense fallback={<UpdatesGridSkeleton />}>
      <CategoryUpdatesClient
        initialPosts={paginatedPosts}
        initialPagination={pagination}
        currentSearch={search}
        currentPage={page}
        breadcrumbItems={breadcrumbItems}
        category={category}
        categoryTitle={categoryTitle}
      />
    </Suspense>
  );
}
