import { Suspense } from 'react';
import { ProjectsGridSkeleton } from '@/components/ui/projects-grid-skeleton';
import { getProjectsPaginated } from '@/sanity/lib/client';
import ProjectsClient from './projects-client';

// Revalidate every 10 minutes (600 seconds)
export const revalidate = 600;

interface ProjectsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    state?: string;
  }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const state = params.state || '';
  const limit = 9;

  // Fetch projects with pagination
  const result = await getProjectsPaginated({
    page,
    limit,
    search,
    state,
  });

  const { projects, pagination } = result;

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Projects' }];

  return (
    <Suspense fallback={<ProjectsGridSkeleton />}>
      <ProjectsClient
        initialProjects={projects}
        initialPagination={pagination}
        currentSearch={search}
        breadcrumbItems={breadcrumbItems}
      />
    </Suspense>
  );
}
