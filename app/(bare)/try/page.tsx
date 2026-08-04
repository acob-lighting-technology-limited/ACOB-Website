import type { Metadata } from 'next';

import LoaderPlayground from './loader-playground';

export const metadata: Metadata = {
  title: 'Loader Playground',
  robots: { index: false, follow: false },
};

export default function TryPage() {
  return <LoaderPlayground />;
}
