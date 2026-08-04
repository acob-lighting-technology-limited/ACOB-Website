import { Metadata } from 'next';
import {
  CATEGORY_INFO,
  SUBCATEGORY_INFO,
} from '@/lib/constants/project-categories';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const categoryInfo = CATEGORY_INFO[slug];
  const subInfo = SUBCATEGORY_INFO[sub];

  if (!categoryInfo || !subInfo) {
    return {
      title: 'Category Not Found - ACOB Lighting Technology Limited',
      description: 'The requested project category could not be found.',
    };
  }

  const title = `${categoryInfo.title} — ${subInfo.title} Projects - ACOB Lighting Technology Limited`;
  const description = `Explore ${subInfo.title.toLowerCase()} projects under ${categoryInfo.title} by ACOB Lighting Technology Limited. ${subInfo.description}`;

  return {
    title,
    description,
    keywords: `${categoryInfo.title}, ${subInfo.title}, solar energy projects, renewable energy, ACOB Lighting, Nigeria solar projects`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://acoblighting.com/projects/category/${slug}/${sub}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ProjectSubcategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
