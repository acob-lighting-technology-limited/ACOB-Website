import { ShimmerSkeleton, SectionSkeleton } from '@/components/ui/skeleton';

// Homepage-specific fallback. HeroSectionV2 is a full h-screen carousel with
// bottom-left content, so it's approximated directly rather than reused from
// the generic PageHeroSkeleton (built for the simpler Hero component).
export default function Loading() {
  return (
    <>
      <div className="relative h-screen w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-md border-l-2 border-border py-1 pl-4">
              <ShimmerSkeleton className="h-4 w-32" />
              <ShimmerSkeleton
                className="mt-3 h-8 w-64"
                style={{ animationDelay: '0.1s' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
      <SectionSkeleton delay={0.1} />
      <SectionSkeleton delay={0.2} />
    </>
  );
}
