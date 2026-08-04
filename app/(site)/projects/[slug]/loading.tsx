import { PageHeroSkeleton, ShimmerSkeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />

      <Container className="px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center space-x-2 md:mb-12">
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

        {/* Overview skeleton */}
        <div className="max-w-[70ch] space-y-4">
          <ShimmerSkeleton className="h-3 w-36" />
          <div className="space-y-3">
            <ShimmerSkeleton
              className="h-6 w-full"
              style={{ animationDelay: '0.1s' } as React.CSSProperties}
            />
            <ShimmerSkeleton
              className="h-6 w-5/6"
              style={{ animationDelay: '0.2s' } as React.CSSProperties}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5">
            <ShimmerSkeleton
              className="h-4 w-32"
              style={{ animationDelay: '0.3s' } as React.CSSProperties}
            />
            <ShimmerSkeleton
              className="h-4 w-16"
              style={{ animationDelay: '0.4s' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Project content skeleton */}
        <div className="mt-8 space-y-4 md:mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerSkeleton
              key={i}
              className={i === 5 ? 'h-4 w-2/3' : 'h-4 w-full'}
              style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
            />
          ))}
          <ShimmerSkeleton
            className="mt-6 aspect-[16/9] w-full rounded-xl"
            style={{ animationDelay: '0.6s' } as React.CSSProperties}
          />
        </div>

        {/* Impact metrics skeleton */}
        <div className="mt-12 grid grid-cols-2 gap-y-8 border-y border-border py-10 md:mt-16 md:grid-cols-4 md:py-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-l border-border pl-4 md:pl-6">
              <ShimmerSkeleton
                className="h-10 w-16"
                style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              />
              <ShimmerSkeleton
                className="mt-2 h-3 w-20"
                style={
                  { animationDelay: `${0.1 + i * 0.1}s` } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>

        {/* Share row skeleton */}
        <div className="mt-14 flex items-center gap-4 border-y border-border py-8">
          <ShimmerSkeleton className="h-4 w-32" />
          <ShimmerSkeleton
            className="h-8 w-24 rounded-full"
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          />
        </div>

        {/* Related projects skeleton */}
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
      </Container>
    </>
  );
}
