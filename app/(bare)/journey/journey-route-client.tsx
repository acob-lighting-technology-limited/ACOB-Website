'use client';

import { useRouter } from 'next/navigation';
import { JourneyExperience } from '@/components/sections/journey-experience';

/** Direct-visit fallback: closing returns to the previous page or home. */
export function JourneyRouteClient() {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return <JourneyExperience onClose={handleClose} />;
}
