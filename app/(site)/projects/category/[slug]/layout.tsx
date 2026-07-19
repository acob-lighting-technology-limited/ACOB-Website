import { Metadata } from 'next';
import { getProjectsPaginated } from '@/sanity/lib/queries';
import { getOgImageUrl } from '@/lib/utils/og-image';
import type { Project } from '@/lib/types';
import { CATEGORY_INFO } from '@/lib/constants/project-categories';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const info = CATEGORY_INFO[slug];

  if (!info) {
    return {
      title: 'Category Not Found - ACOB Lighting Technology Limited',
      description: 'The requested project category could not be found.',
    };
  }

  // Get first project from this category for og image
  const result = await getProjectsPaginated({ page: 1, limit: 6 });
  const projects = result.projects;
  const categoryProject = projects.find(
    (p: Project) => p.categories?.includes(slug) && p.projectImage,
  );

  const ogImage = categoryProject?.projectImage
    ? getOgImageUrl(categoryProject.projectImage)
    : 'https://www.acoblighting.com/images/og-image.jpg';

  return {
    title: `${info.title} Projects - ACOB Lighting Technology Limited`,
    description: `Explore ${info.title.toLowerCase()} projects by ACOB Lighting Technology Limited. ${info.description}`,
    keywords: `${info.title}, solar energy projects, renewable energy, ACOB Lighting, Nigeria solar projects`,
    openGraph: {
      title: `${info.title} Projects - ACOB Lighting Technology Limited`,
      description: info.description,
      type: 'website',
      url: `https://acoblighting.com/projects/category/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${info.title} Projects - ACOB Lighting`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${info.title} Projects - ACOB Lighting Technology Limited`,
      description: info.description,
      images: [ogImage],
    },
  };
}

export default function ProjectCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
