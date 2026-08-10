'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel';
import { FadeIn } from '@/components/animations/FadeIn';
import type { Project } from '@/lib/types';
import { applySanityImagePreset } from '@/lib/utils/sanity-image';

interface ProjectsSectionProps {
  projects: Project[];
}

function projectLocation(project: Project) {
  const state =
    project.state &&
    (project.state.toUpperCase() === 'FCT' ? 'FCT' : `${project.state} State`);
  if (project.location && state) {
    return `${project.location}, ${state}`;
  }
  return project.location || state || 'Nigeria';
}

export function ProjectsSection({ projects = [] }: ProjectsSectionProps) {
  const displayProjects = Array.isArray(projects) ? projects.slice(0, 3) : [];
  const hasProjects = displayProjects.length > 0;

  if (!hasProjects) {
    return (
      <section className="border-b border-border-[0.5px] bg-background py-12 sm:py-16 lg:py-20 xl:py-24">
        <Container className="px-4">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Featured Deployments
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our project portfolio is being refreshed. Check back soon or
              explore our full project stories.
            </p>
            <Link href="/projects" className="mt-8">
              <Button size="lg">View Projects Archive</Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="border-b border-border-[0.5px] bg-background py-12 sm:py-16 lg:py-20 xl:py-24">
      <Container className="px-4">
        {/* Header */}
        <div className="mb-10 max-w-2xl md:mb-14">
          <FadeIn delay={0.1}>
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
              Our portfolio
            </span>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Selected Energy
              <br />
              Deployments.
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Each project is engineered to deliver bankable returns, resilient
              operations, and measurable socio-economic impact for communities
              across Nigeria.
            </p>
          </FadeIn>
        </div>

        {/* Swipeable on mobile; embla deactivates at sm and up, leaving a
            static 2/3-column row. */}
        <Carousel
          opts={{
            containScroll: false,
            breakpoints: { '(min-width: 640px)': { active: false } },
          }}
        >
          <CarouselContent className="-ml-4 sm:-ml-6">
            {displayProjects.map((project, index) => {
              const projectImage = project.projectImage
                ? applySanityImagePreset(project.projectImage, 'card')
                : '/images/olooji-community.webp?height=600&width=900';

              return (
                <CarouselItem
                  key={project._id}
                  className="basis-[85%] pl-4 sm:basis-1/2 sm:pl-6 lg:basis-1/3"
                >
                  <FadeIn
                    delay={index * 0.08}
                    direction="up"
                    className="h-full"
                  >
                    <Link
                      href={`/projects/${project.slug?.current}`}
                      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                          <Image
                            src={projectImage}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                            quality={80}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-3 left-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/90">
                            {projectLocation(project)}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-4 md:p-5">
                          <h3 className="text-base font-extrabold tracking-tight text-foreground line-clamp-2 md:text-lg">
                            {project.title}
                          </h3>
                          <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3 md:text-sm">
                            {project.excerpt || 'Project details coming soon.'}
                          </p>
                          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary md:text-sm">
                            View project
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 md:h-4 md:w-4" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </FadeIn>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselDots className="mt-6 sm:hidden" />
        </Carousel>

        {/* View All */}
        <FadeIn delay={0.3}>
          <div className="mt-12 text-center">
            <Link href="/projects">
              <Button className="px-8 py-3">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
