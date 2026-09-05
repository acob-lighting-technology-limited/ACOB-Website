import { AnnouncementBanner } from '@/components/ui/announcement-banner';
import { getJobPostings } from '@/sanity/lib/queries';

/**
 * The job count, fetched away from the layout shell.
 *
 * Awaiting Sanity directly in the (site) layout held back the entire shell —
 * including the intro panel, whose whole point is to paint on the first byte.
 * Behind a Suspense boundary the shell streams immediately and the banner
 * arrives when the query lands.
 *
 * Nothing is lost by deferring it: AnnouncementBanner mounts hidden and reveals
 * itself in an effect, so it was never part of the first paint anyway.
 */
export default async function AnnouncementBannerSlot() {
  const jobPostings = await getJobPostings();

  return <AnnouncementBanner jobCount={jobPostings.length} />;
}
