import { PageHeroSkeleton, ShimmerSkeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />

      <Container className="px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center space-x-2">
          <ShimmerSkeleton className="w-16 h-4" />
          <ShimmerSkeleton
            className="w-10 h-4"
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          />
          <ShimmerSkeleton
            className="w-24 h-4"
            style={{ animationDelay: '0.2s' } as React.CSSProperties}
          />
        </div>

        {/* Meta row skeleton */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton
            className="h-4 w-32"
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          />
          <ShimmerSkeleton
            className="h-4 w-20"
            style={{ animationDelay: '0.2s' } as React.CSSProperties}
          />
        </div>

        {/* Article body skeleton */}
        <div className="mt-10 space-y-4 md:mt-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton
              key={i}
              className={i === 7 ? 'h-4 w-2/3' : 'h-4 w-full'}
              style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Tags row skeleton */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <ShimmerSkeleton className="h-4 w-16" />
          {[1, 2, 3].map(i => (
            <ShimmerSkeleton
              key={i}
              className="h-6 w-16 rounded-full"
              style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Share row skeleton */}
        <div className="mt-10 flex items-center gap-4 border-t border-border pt-8">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton
            className="h-8 w-24 rounded-full"
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          />
        </div>

        {/* Related posts skeleton */}
        <div className="mt-16 md:mt-20">
          <div className="mb-8 max-w-xl space-y-3">
            <ShimmerSkeleton className="h-3 w-28" />
            <ShimmerSkeleton
              className="h-7 w-56"
              style={{ animationDelay: '0.1s' } as React.CSSProperties}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <ShimmerSkeleton
                  className="aspect-[16/10] w-full rounded-xl"
                  style={
                    { animationDelay: `${i * 0.1}s` } as React.CSSProperties
                  }
                />
                <ShimmerSkeleton
                  className="h-5 w-3/4"
                  style={
                    {
                      animationDelay: `${0.1 + i * 0.1}s`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments skeleton */}
        <div className="mt-16 space-y-5 border-t border-border pt-8 md:mt-20">
          <ShimmerSkeleton className="h-6 w-40" />
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 py-5">
              <ShimmerSkeleton
                className="h-10 w-10 shrink-0 rounded-full"
                style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              />
              <div className="flex-1 space-y-2">
                <ShimmerSkeleton className="h-4 w-32" />
                <ShimmerSkeleton className="h-4 w-full" />
                <ShimmerSkeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Comment form skeleton */}
        <div className="mt-10 space-y-4">
          <ShimmerSkeleton className="h-6 w-40" />
          <ShimmerSkeleton className="h-10 w-full rounded-md" />
          <ShimmerSkeleton className="h-10 w-full rounded-md" />
          <ShimmerSkeleton className="h-24 w-full rounded-md" />
          <ShimmerSkeleton className="h-10 w-32 rounded-md" />
        </div>
      </Container>
    </>
  );
}
