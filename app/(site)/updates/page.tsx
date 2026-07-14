import { Suspense } from 'react';
import { UpdatesGridSkeleton } from '@/components/ui/updates-grid-skeleton';
import { getUpdatePostsPaginated } from '@/sanity/lib/client';
import UpdatesClient from './updates-client';

interface UpdatesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const limit = 9;

  // Fetch posts with pagination
  const result = await getUpdatePostsPaginated({
    page,
    limit,
    search,
  });

  const { posts, pagination } = result;

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Updates' }];

  return (
    <Suspense fallback={<UpdatesGridSkeleton />}>
      <UpdatesClient
        initialPosts={posts}
        initialPagination={pagination}
        currentSearch={search}
        breadcrumbItems={breadcrumbItems}
      />
    </Suspense>
  );
}
