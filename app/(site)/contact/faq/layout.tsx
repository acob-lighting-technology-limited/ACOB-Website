import { Metadata } from 'next';
import { getOgImageUrl } from '@/lib/utils/og-image';

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = getOgImageUrl('/images/contact/faq-hero.webp');

  return {
    title: 'Frequently Asked Questions - Solar Energy FAQs | ACOB Lighting',
    description:
      'Find answers to common questions about ACOB Lighting, solar energy systems, installation, costs, maintenance, and clean energy solutions in Nigeria.',
    keywords:
      'ACOB Lighting FAQ, solar energy FAQ, solar panel questions, solar installation guide, solar system costs, solar maintenance, renewable energy questions, Nigeria solar FAQ',
    openGraph: {
      title: 'Frequently Asked Questions - ACOB Lighting Technology Limited',
      description:
        'Get answers to your solar energy and company questions from Nigerian renewable energy experts.',
      type: 'website',
      url: 'https://acoblighting.com/contact/faq',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'ACOB Lighting FAQ - Solar Energy Questions',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Frequently Asked Questions - ACOB Lighting Technology Limited',
      description:
        'Get answers to your solar energy and company questions from Nigerian renewable energy experts.',
      images: [ogImage],
    },
  };
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
