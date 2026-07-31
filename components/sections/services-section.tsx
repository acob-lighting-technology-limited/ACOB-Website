'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Button, Container } from '@/components/ui';
import { FadeIn } from '../animations/FadeIn';
import { servicesData } from '@/lib/data';

const ServicesSection = React.memo(function ServicesSection() {
  const services = useMemo(() => servicesData.slice(0, 3), []);

  return (
    <section className="border-b border-border-[0.5px] bg-[radial-gradient(circle_at_top,_rgba(8,_145,_63,_0.07),_transparent_55%)] py-12 sm:py-16 lg:py-20 xl:py-24 transition-all duration-500 dark:bg-zinc-950">
      <Container className="px-4">
        {/* Header */}
        <div className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <FadeIn delay={0.1}>
            <div>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                What we do
              </span>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Integrated Energy
                <br />
                for Every Scale.
              </h2>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                From concept to long-term O&amp;M, we help governments,
                developers, and operators unlock reliable, efficient power.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link href="/services" className="inline-block min-h-[48px]">
                <Button size="lg" className="px-8 py-6 text-base min-h-[48px]">
                  View all services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact" className="inline-block min-h-[48px]">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base min-h-[48px]"
                >
                  Partner with us
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Card grid — swipeable on mobile, static grid from sm up */}
        <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {services.map((service, index) => (
            <FadeIn
              key={service.slug as string}
              delay={index * 0.08}
              direction="up"
              className="h-full w-[85%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <Link
                href={`/services/${service.slug}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={service.image || '/placeholder.svg'}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/90">
                      {service.category ?? 'Renewable Solutions'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <h3 className="text-base font-extrabold tracking-tight text-foreground line-clamp-2 md:text-lg">
                      {service.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3 md:text-sm">
                      {service.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary md:text-sm">
                      See solution
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 md:h-4 md:w-4" />
                    </span>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
});

export { ServicesSection };
