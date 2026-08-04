import { notFound } from 'next/navigation';
import { getProjectsBySubcategoryPaginated } from '@/sanity/lib/queries';
import {
  CATEGORY_INFO,
  SUBCATEGORY_INFO,
} from '@/lib/constants/project-categories';
import SubcategoryClient from './subcategory-client';

interface SubcategoryPageProps {
  params: Promise<{
    slug: string;
    sub: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { slug, sub } = await params;
  const { page: pageParam, search = '' } = await searchParams;
  const categoryInfo = CATEGORY_INFO[slug];
  const subInfo = SUBCATEGORY_INFO[sub];

  if (!categoryInfo || !subInfo) {
    notFound();
  }

  const page = parseInt(pageParam || '1', 10);

  const { projects, pagination } = await getProjectsBySubcategoryPaginated({
    category: slug,
    subcategory: sub,
    page,
    limit: 9,
    search,
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: categoryInfo.title, href: `/projects/category/${slug}` },
    { label: subInfo.title },
  ];

  return (
    <SubcategoryClient
      categorySlug={slug}
      subSlug={sub}
      categoryTitle={categoryInfo.title}
      subTitle={subInfo.title}
      subDescription={subInfo.description}
      fallbackImage={categoryInfo.fallbackImage}
      initialProjects={projects}
      initialPagination={pagination}
      currentSearch={search}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
