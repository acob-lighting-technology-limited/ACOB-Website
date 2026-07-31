import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FadeIn } from '@/components/animations/FadeIn';

interface ComingSoonProps {
  title: string;
  description?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  backgroundImage?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title,
  description = "We're working on something amazing. This page will be available soon!",
  breadcrumbItems,
  backgroundImage,
  backHref = '/',
  backLabel = 'Back to Home',
}: ComingSoonProps) {
  return (
    <>
      {backgroundImage ? (
        <Hero
          title={title}
          description={title}
          image={backgroundImage}
          titleSize="display"
        />
      ) : null}

      <Container className="px-4 py-8">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} className="mb-8 md:mb-12" />
        )}

        <FadeIn>
          <div className="flex min-h-[55vh] flex-col justify-center border-t-[3px] border-foreground py-12 md:min-h-[60vh] md:py-16">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Coming soon
            </span>
            <p className="mt-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {description}
            </p>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
              We&apos;re working hard to bring you an improved experience. Check
              back soon for updates.
            </p>

            <Link href={backHref} className="mt-10 inline-block">
              <Button variant="outline" size="lg" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {backLabel}
              </Button>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </>
  );
}
