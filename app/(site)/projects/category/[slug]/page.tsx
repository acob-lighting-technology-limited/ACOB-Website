import { notFound } from 'next/navigation';
import { getProjectsByCategoryPaginated } from '@/sanity/lib/queries';
import { CATEGORY_INFO } from '@/lib/constants/project-categories';
import CategoryClient from './category-client';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam, search = '' } = await searchParams;
  const info = CATEGORY_INFO[slug];

  if (!info) {
    notFound();
  }

  const page = parseInt(pageParam || '1', 10);

  const { projects, pagination } = await getProjectsByCategoryPaginated({
    category: slug,
    page,
    limit: 9,
    search,
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: info.title },
  ];

  return (
    <CategoryClient
      categorySlug={slug}
      categoryTitle={info.title}
      categoryDescription={info.description}
      fallbackImage={info.fallbackImage}
      initialProjects={projects}
      initialPagination={pagination}
      currentSearch={search}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
