import { PageHeroSkeleton, ShimmerSkeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <Container className="px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2">
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

        {/* Standfirst skeleton */}
        <div className="mt-8 max-w-[68ch] space-y-3">
          <ShimmerSkeleton className="h-3 w-32" />
          <ShimmerSkeleton
            className="h-6 w-full"
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          />
          <ShimmerSkeleton
            className="h-6 w-5/6"
            style={{ animationDelay: '0.2s' } as React.CSSProperties}
          />
        </div>

        {/* Map skeleton */}
        <ShimmerSkeleton
          className="mt-10 aspect-[16/9] w-full rounded-xl md:mt-14"
          style={{ animationDelay: '0.3s' } as React.CSSProperties}
        />

        {/* Stat band skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-y-8 border-y border-border py-10 md:mt-10 md:grid-cols-4 md:py-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-l border-border pl-4 md:pl-6">
              <ShimmerSkeleton
                className="h-10 w-16"
                style={
                  { animationDelay: `${0.4 + i * 0.1}s` } as React.CSSProperties
                }
              />
              <ShimmerSkeleton
                className="mt-2 h-3 w-20"
                style={
                  { animationDelay: `${0.5 + i * 0.1}s` } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
