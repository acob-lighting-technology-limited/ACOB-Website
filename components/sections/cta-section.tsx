'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { CONTACT_INFO } from '@/lib/constants/app.constants';

export function CtaSection() {
  const email = CONTACT_INFO.email.general;
  const phone = CONTACT_INFO.phone.primary;

  const targetRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll progress through the tall wrapper: 0 when its top hits the
  // viewport top (sticky pin engages), 1 when its bottom leaves. Measured
  // live from getBoundingClientRect so lazy-loaded sections above cannot
  // leave us with stale offsets (which useScroll suffers from).
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = targetRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      if (runway <= 0) {
        return;
      }
      const progress = Math.min(1, Math.max(0, -rect.top / runway));
      scrollYProgress.set(progress);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollYProgress]);

  // Circle grows from a small dot to covering the whole viewport
  // (150% radius guarantees full coverage in screen corners).
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.75],
    ['circle(3.5% at 50% 50%)', 'circle(150% at 50% 50%)'],
  );

  // Content fades in progressively while the circle opens, so it never
  // pops in abruptly. Fully scroll-driven, so it reverses on scroll up.
  const contentOpacity = useTransform(scrollYProgress, [0.15, 0.65], [0, 1]);

  const ctaContent = (
    <Container className="relative px-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="mb-4 inline-block rounded-full border border-primary-foreground/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide backdrop-blur-sm">
          Let&apos;s work together
        </span>

        <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-primary-foreground">
          Ready to power your next project?
        </h2>

        <p className="mt-5 max-w-2xl text-base md:text-lg text-primary-foreground/90">
          From feasibility to commissioning and long-term operations, our team
          is ready to design a dependable clean-energy solution for your
          community, business, or agency. Let&apos;s talk about what you want to
          build.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/contact">
            <Button
              size="lg"
              variant="secondary"
              className="w-full px-8 py-6 text-base font-semibold sm:w-auto"
            >
              Get in touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/projects">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground/40 bg-transparent px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-white hover:text-primary sm:w-auto"
            >
              View our projects
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-sm text-primary-foreground/90 sm:flex-row sm:gap-8">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Mail className="h-4 w-4" />
            {email}
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>
        </div>
      </div>
    </Container>
  );

  // Reduced motion: skip the scroll choreography, render a plain CTA band.
  if (prefersReducedMotion) {
    return (
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-16 sm:py-20 lg:py-24">
        {ctaContent}
      </section>
    );
  }

  return (
    /*
     * Tall wrapper (200vh) creates the scroll runway. The inner viewport is
     * sticky, so the page appears to pause while scroll progress drives the
     * circle reveal — then normal scrolling resumes past the wrapper.
     */
    <section ref={targetRef} className="relative h-[200vh] bg-background">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Green CTA layer, revealed through the expanding circle. The
            content is always rendered inside, so the growing circle acts
            like a window zooming into the finished CTA. */}
        <motion.div
          style={{ clipPath, willChange: 'clip-path' }}
          className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground"
        >
          {/* Subtle background accents */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

          <motion.div style={{ opacity: contentOpacity }} className="w-full">
            {ctaContent}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
