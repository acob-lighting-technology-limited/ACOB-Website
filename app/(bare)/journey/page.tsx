import type { Metadata } from 'next';
import { JourneyRouteClient } from './journey-route-client';
import { ANNIVERSARY_2026 } from '@/lib/constants/anniversary';

export const metadata: Metadata = {
  title: `The Journey | ${ANNIVERSARY_2026.title} | ACOB Lighting Technology Limited`,
  description: `${ANNIVERSARY_2026.extendedSummary}`,
  openGraph: {
    title: `The Journey | ${ANNIVERSARY_2026.title}`,
    description: ANNIVERSARY_2026.summary,
    type: 'website',
    url: 'https://www.acoblighting.com/journey',
    siteName: 'ACOB Lighting Technology Limited',
  },
};

export default function JourneyPage() {
  return <JourneyRouteClient />;
}
