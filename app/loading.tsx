/**
 * Route-transition fallback.
 *
 * Deliberately just the brand surface — no wordmark.
 *
 * This is server-rendered, so on a cold load it paints before the route
 * resolves and the intro overlay mounts. Anything recognisable here gets shown
 * *before* the intro builds it, which read as "the finished logo, then the
 * animation of the logo". A plain panel hands over to the overlay invisibly.
 *
 * Longer client-side route changes are covered by the NProgress bar in the
 * root layout, so nothing is lost by keeping this silent.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-[hsl(var(--loader-surface))] transition-colors duration-500" />
  );
}
