import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Grid3x3,
  Map,
  MapPin,
  Users,
  Zap,
} from 'lucide-react';

import { FadeIn } from '@/components/animations/FadeIn';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { SectionHeader } from '@/components/ui/section-header';
import { NigeriaReachSection } from '@/components/sections/nigeria-reach-section';
import { COMPANY_INFO } from '@/lib/constants';
import { getProjectsForListing } from '@/sanity/lib/queries';

export const metadata: Metadata = {
  title: 'Our Reach | ACOB Lighting',
  description:
    "Explore ACOB's project footprint, active project states, and community impact across Nigeria.",
};

export const revalidate = 300;

const reachHighlights = [
  {
    icon: MapPin,
    label: 'Communities Served',
    value: `${COMPANY_INFO.stats.communitiesServed}+`,
    description:
      'Communities with delivered clean energy and lighting infrastructure.',
  },
  {
    icon: Grid3x3,
    label: 'Installed Capacity',
    value: `${COMPANY_INFO.stats.totalCapacityMW}MW+`,
    description:
      'Combined deployed capacity powering productive use and essential services.',
  },
  {
    icon: Users,
    label: 'Beneficiaries',
    value: '50K+',
    description:
      'People benefiting from our energy access and lighting interventions.',
  },
  {
    icon: Zap,
    label: 'Installed Projects',
    value: `${COMPANY_INFO.stats.projectsCompleted}+`,
    description:
      'Completed projects delivered across communities, institutions, and commercial sites.',
  },
];

const reachDetails = [
  {
    icon: Map,
    title: 'Active Project States',
    description:
      'Green states indicate locations where ACOB has active project presence.',
  },
  {
    icon: MapPin,
    title: 'Project Sites',
    description:
      'Black dots represent individual project sites positioned from stored coordinates.',
  },
  {
    icon: Building2,
    title: 'Headquarters',
    description:
      'The HQ marker points to our main office and links directly to our locations page.',
  },
];

export default async function OurReachPage() {
  const projects = await getProjectsForListing();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Our Reach' },
  ];

  return (
    <>
      <Hero
        title="Our Reach"
        description="Tracking ACOB's growing project footprint across Nigeria"
        image="/images/about/our-reach.webp"
      />

      <Container>
        <Breadcrumb items={breadcrumbItems} className="mb-10" />

        <section className="mb-12 rounded-3xl border border-border bg-surface p-4 sm:p-6 xl:p-8 shadow-sm">
          <SectionHeader
            badge="National Footprint"
            align="left"
            title="Where our work is creating energy access"
            description="This map highlights the states where we are active, our project sites, and our headquarters. Use it to quickly explore the breadth of our deployment activity across Nigeria."
          />
        </section>

        <section className="mb-12">
          <NigeriaReachSection projects={projects} />
        </section>

        <section className="mb-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {reachHighlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <FadeIn
                key={item.label}
                delay={index * 0.12}
                direction="up"
                className="h-full"
              >
                <Card className="group h-full rounded-3xl border border-border bg-surface shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="space-y-4 p-6">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary">
                      <div className="absolute inset-0 origin-center scale-0 rounded-full bg-primary transition-transform duration-500 ease-out group-hover:scale-100" />
                      <Icon className="relative z-10 h-6 w-6 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {item.value}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </section>

        <section className="mb-16 rounded-3xl border border-border bg-surface p-4 sm:p-6 xl:p-8 shadow-sm">
          <SectionHeader
            badge="What This Shows"
            align="left"
            title="A clearer view of our operational footprint"
            description="The map is designed to make our delivery footprint easy to read at a glance."
            className="mb-6"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {reachDetails.map((item, index) => {
              const Icon = item.icon;

              return (
                <FadeIn
                  key={item.title}
                  delay={index * 0.12}
                  direction="up"
                  className="h-full"
                >
                  <Card className="group h-full rounded-2xl border border-border bg-muted/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="relative mb-4 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary">
                        <div className="absolute inset-0 origin-center scale-0 rounded-full bg-primary transition-transform duration-500 ease-out group-hover:scale-100" />
                        <Icon className="relative z-10 h-5 w-5 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <div className="mt-12 mb-8 text-center">
          <Link href="/about">
            <Button variant="outline" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to About Overview
            </Button>
          </Link>
        </div>
      </Container>
    </>
  );
}
