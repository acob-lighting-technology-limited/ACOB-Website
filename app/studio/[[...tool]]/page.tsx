'use client';

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import dynamic from 'next/dynamic';
import config from '../../../sanity.config';

const NextStudio = dynamic(
  () => import('next-sanity/studio').then(mod => ({ default: mod.NextStudio })),
  {
    ssr: false,
    loading: () => <div>Loading Sanity Studio...</div>,
  }
);

export default function StudioPage() {
  return <NextStudio config={config} />;
}
