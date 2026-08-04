'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FadeIn } from '../animations/FadeIn';
import {
  ANNIVERSARY_2026,
  isAnniversaryYear2026,
} from '@/lib/constants/anniversary';

const commitments = [
  'Community-first electrification strategies built with local partners',
  'Complete engineering for solar PV, hybrid mini-grids, and storage',
  'Performance monitoring, O&M, and training for long-term reliability',
];

const supportAreas = [
  {
    title: 'Advisory & Audits',
    description:
      'Site assessments, energy modelling, and regulatory guidance to chart the best path forward.',
  },
  {
    title: 'Engineering & Delivery',
    description:
      'Design, procurement, installation, and commissioning of high-performance solar and storage assets.',
  },
  {
    title: 'Operations & Growth',
    description:
      'Managed services and training that keep systems productive and communities powered.',
  },
  {
    title: 'Investment Support',
    description:
      'Business models and financing structures tuned for rapid scale and measurable impact.',
  },
];

export function AboutSectionV2() {
  const showAnniversary = isAnniversaryYear2026();

  return (
    <section className="relative overflow-hidden border-b border-border-[0.5px] bg-primary py-12 text-primary-foreground transition-all duration-500 sm:py-16 lg:py-20 xl:py-24">
      {/* Soften the flat saturated green with a little depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15" />

      <Container className="relative px-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <FadeIn delay={0.1}>
            <div>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-primary-foreground/80">
                Who we are
              </span>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
                ACOB Lighting Technology<span className="opacity-70">.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base text-primary-foreground/90 md:text-lg">
                Powering Nigeria with dependable renewable energy systems that
                help households, industries, and governments unlock sustainable
                growth. From strategy to implementation, our team manages every
                stage of the clean energy lifecycle.
              </p>

              {showAnniversary && (
                <p className="mt-4 max-w-xl text-base text-primary-foreground/80 md:text-lg">
                  {ANNIVERSARY_2026.extendedSummary}
                </p>
              )}

              <div className="mt-6 divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
                {commitments.map(item => (
                  <div key={item} className="flex items-start gap-3 py-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary-foreground/70" />
                    <span className="text-sm leading-relaxed text-primary-foreground/90 md:text-base">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-6 rounded-3xl bg-white/10 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl sm:p-6 xl:p-8">
              <h3 className="text-xl font-semibold uppercase tracking-wide text-primary-foreground">
                How we support your energy transition
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {supportAreas.map((area, i) => (
                  <FadeIn
                    key={area.title}
                    delay={0.1 + i * 0.05}
                    direction="up"
                  >
                    <div className="group h-full cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                      <h4 className="text-lg font-semibold text-primary-foreground">
                        {area.title}
                      </h4>
                      <p className="mt-2 text-sm text-primary-foreground/95">
                        {area.description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <Link href="/about" className="inline-flex">
                <Button
                  size="lg"
                  className="border-2 border-white/70 bg-transparent px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-white hover:text-primary"
                >
                  Learn about our mission
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
