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
}

export function ComingSoon({
  title,
  description = "We're working on something amazing. This page will be available soon!",
  breadcrumbItems,
  backgroundImage,
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
          <div className="max-w-[62ch] border-t-[3px] border-foreground pt-8 md:pt-10">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-primary">
              Coming soon
            </span>
            <p className="mt-4 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
              {description}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              We&apos;re working hard to bring you an improved experience. Check
              back soon for updates.
            </p>

            <Link href="/" className="mt-8 inline-block">
              <Button variant="outline" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Button>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </>
  );
}
