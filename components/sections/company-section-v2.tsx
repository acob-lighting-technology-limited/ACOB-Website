'use client';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FadeIn } from '../animations/FadeIn';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { AnimatedFillText } from '../ui/animated-fill-text';

const impactHighlights = [
  {
    title: 'Community electrification',
    description:
      'Design-build-operate models for rural communities integrating solar PV, storage, and productive-use assets.',
  },
  {
    title: 'Commercial solar programs',
    description:
      'Hybrid systems that stabilize operations for manufacturing, healthcare, telecom, and public infrastructure.',
  },
  {
    title: 'Capacity building',
    description:
      'Training technicians, project owners, and community operatives to maintain sustainable energy assets.',
  },
];

const missionStatements = [
  'We are a Nigerian-born company advancing equitable energy access through robust renewable infrastructure.',
  'Our field teams, engineers, and financing partners work hand-in-hand to deliver energy security and economic opportunity.',
  'By coupling technology with local insights, we deploy solutions that perform in the toughest operating environments.',
];

const capabilities = [
  {
    title: 'Advisory & development',
    description:
      'Feasibility, ESG impact studies, regulatory navigation, and project structuring.',
  },
  {
    title: 'Engineering & operations',
    description:
      'EPC delivery, asset management, remote monitoring, and lifecycle optimisation.',
  },
];

export function CompanySectionV2() {
  return (
    <section className="relative overflow-hidden bg-background py-12 transition-all duration-500 sm:py-16 lg:py-20 xl:py-24">
      <Container className="relative px-4">
        {/* Header */}
        <FadeIn delay={0.1}>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-14">
            <div>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                Why ACOB
              </span>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Why Trust{' '}
                <AnimatedFillText className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-4xl lg:text-5xl">
                  ACOB Lighting?
                </AnimatedFillText>
              </h2>
            </div>
            <Link href="/about" className="hidden sm:inline-flex">
              <Button size="lg" className="px-8 py-6 text-base">
                Learn about our leadership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — mission + capabilities */}
          <FadeIn delay={0.15}>
            <div>
              <div className="space-y-4">
                {missionStatements.map(statement => (
                  <p
                    key={statement}
                    className="text-base leading-relaxed text-muted-foreground md:text-lg"
                  >
                    {statement}
                  </p>
                ))}
              </div>

              <Link href="/about" className="mt-6 inline-flex sm:hidden">
                <Button size="lg" className="px-8 py-6 text-base">
                  Learn about our leadership
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <div className="mt-8 border-t border-border pt-6">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-primary">
                  Strategic capabilities
                </span>
                <div className="mt-4 divide-y divide-border border-y border-border">
                  {capabilities.map((cap, i) => (
                    <div
                      key={cap.title}
                      className="grid grid-cols-[36px_1fr] gap-x-4 py-5"
                    >
                      <span className="text-sm font-extrabold tabular-nums text-primary">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-foreground md:text-lg">
                          {cap.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {cap.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/projects" className="inline-flex flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full px-8 py-6 text-base"
                  >
                    Explore our impact case studies
                  </Button>
                </Link>
                <Link href="/contact" className="inline-flex flex-1">
                  <Button size="lg" className="w-full px-8 py-6 text-base">
                    Discuss your energy roadmap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right — image + impact highlights */}
          <FadeIn delay={0.2}>
            <div className="space-y-8">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-border">
                <Image
                  src="/images/company-team.webp"
                  alt="ACOB Lighting field engineers on-site"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-sm text-white/95 md:p-6">
                  We deploy skilled engineers nationwide, building
                  climate-resilient micro-grids that power households, schools,
                  and enterprise hubs.
                </p>
              </div>

              <div className="divide-y divide-border border-y border-border">
                {impactHighlights.map((highlight, i) => (
                  <FadeIn key={highlight.title} delay={i * 0.1}>
                    <div className="py-5">
                      <h4 className="text-base font-bold text-foreground md:text-lg">
                        {highlight.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {highlight.description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
