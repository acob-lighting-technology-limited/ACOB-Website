import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
  getProjects,
  getProject,
  getProjectsPaginated,
} from '@/sanity/lib/queries';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/ui/hero';
import type { Project } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ShareCopy } from '@/components/updates/share-copy';
import { ProjectContent } from './project-content';
import { ImpactMetrics } from '@/components/projects/impact-metrics';
import { StateProjectsView } from './state-projects-view';
import { CATEGORY_INFO } from '@/lib/constants/project-categories';
import { getCalculatedImpactMetrics } from '@/lib/utils';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Slug to Sanity state value mapping
const stateMapping: Record<string, string> = {
  jigawa: 'Jigawa',
  borno: 'Borno',
  nasarawa: 'Nasarawa',
  kaduna: 'Kaduna',
  kano: 'Kano',
  kogi: 'Kogi',
  rivers: 'Rivers',
  enugu: 'Enugu',
  delta: 'Delta',
};

// Display name mapping
const stateDisplayMapping: Record<string, string> = {
  jigawa: 'Jigawa State',
  borno: 'Borno State',
  nasarawa: 'Nasarawa State',
  kaduna: 'Kaduna State',
  kano: 'Kano State',
  kogi: 'Kogi State',
  rivers: 'Rivers State',
  enugu: 'Enugu State',
  delta: 'Delta State',
  abuja: 'Abuja (FCT)',
  ondo: 'Ondo State',
};

export async function generateStaticParams() {
  const projects = await getProjects();
  const stateSlugs = Object.keys(stateMapping).map(state => ({ slug: state }));
  const projectSlugs = projects.map((project: Project) => ({
    slug: project.slug.current,
  }));
  return [...projectSlugs, ...stateSlugs];
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  // 1. Try to fetch a single project
  const project = await getProject(slug);

  if (project) {
    project.impactMetrics = getCalculatedImpactMetrics(
      project,
      project.impactMetrics,
    );
  }

  // 2. If no project, check if it's a state slug
  if (!project) {
    const sanityStateValue = stateMapping[slug.toLowerCase()];
    const displayName = stateDisplayMapping[slug.toLowerCase()];

    if (sanityStateValue) {
      const { projects } = await getProjectsPaginated({
        state: sanityStateValue,
        limit: 100,
      });

      return (
        <StateProjectsView
          projects={projects}
          displayName={displayName || slug}
        />
      );
    }

    notFound();
  }

  // Fetch all projects and calculate relevance score to filter related projects
  const allProjects = await getProjects();
  const currentCategories =
    project.categories || (project.category ? [project.category] : []);
  const currentSubcategory = project.subcategory;

  const relatedProjects = allProjects
    .filter((p: Project) => p.slug.current !== slug)
    .map((p: Project) => {
      let score = 0;
      const pCategories = p.categories || (p.category ? [p.category] : []);

      // Share category matching
      const sharedCategories = pCategories.filter(cat =>
        currentCategories.includes(cat),
      );
      score += sharedCategories.length * 10;

      // Subcategory matching
      if (p.subcategory && p.subcategory === currentSubcategory) {
        score += 5;
      }

      return { project: p, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Fallback: Newer projects first
      const dateA = a.project.projectDate
        ? new Date(a.project.projectDate).getTime()
        : 0;
      const dateB = b.project.projectDate
        ? new Date(b.project.projectDate).getTime()
        : 0;
      return dateB - dateA;
    })
    .map(item => item.project)
    .slice(0, 3);
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: project.title },
  ];

  return (
    <>
      <Hero
        title="Our Projects"
        description={project.title}
        image={project.projectImage}
      />

      <Container className="px-4 py-8 relative">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        {/* Overview */}
        <Card className="pt-2">
          <CardContent className="p-4 sm:p-6 xl:p-8 space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
                Project Overview
              </h2>
              <p className="text-muted-foreground dark:text-foreground/80 leading-relaxed text-lg">
                {project.description || project.excerpt}
              </p>

              {/* Project Location */}
              {project.location && (
                <div className="flex flex-wrap items-center text-muted-foreground mt-6 gap-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">
                      {project.location}
                      {project.state &&
                        `, ${project.state.toUpperCase() === 'FCT' ? 'FCT' : `${project.state} State.`}`}
                    </span>
                  </div>
                  <span className="hidden sm:inline mx-2">•</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">
                      {new Date(
                        project.projectDate || project._createdAt,
                      ).getFullYear()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Project Content */}
            {(project.projectContent || project.content) && (
              <div className="mt-6 prose prose-lg max-w-none">
                <ProjectContent
                  content={project.content}
                  projectContent={project.projectContent}
                  project={project}
                />
              </div>
            )}

            {/* Impact Metrics */}
            {project.impactMetrics && (
              <ImpactMetrics metrics={project.impactMetrics} />
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-4 pt-8 border-t mt-6">
              <ShareCopy className="rounded-full bg-transparent" />
            </div>
          </CardContent>
        </Card>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Related Projects</h3>
              <Link
                href="/projects"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProjects.map((relatedProject: Project) => (
                <Link
                  key={relatedProject._id}
                  href={`/projects/${relatedProject.slug.current}`}
                  className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    {relatedProject.projectImage ? (
                      <Image
                        src={relatedProject.projectImage}
                        alt={relatedProject.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                        <span className="text-4xl font-bold text-primary/20 select-none">
                          ACOB
                        </span>
                      </div>
                    )}
                    {relatedProject.categories?.[0] && (
                      <div className="absolute top-3 left-3">
                        <Badge className="text-[10px] uppercase tracking-wide shadow">
                          {CATEGORY_INFO[relatedProject.categories[0]]?.title ??
                            relatedProject.categories[0]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                      {relatedProject.title}
                    </h4>
                    {relatedProject.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {relatedProject.description}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60">
                      {relatedProject.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {relatedProject.location}
                            {relatedProject.state &&
                              `, ${relatedProject.state.toUpperCase() === 'FCT' ? 'FCT' : `${relatedProject.state} State`}`}
                          </span>
                        </div>
                      )}
                      {relatedProject.projectDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(relatedProject.projectDate).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        View project
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Projects Button */}
        <div className="mt-12 mb-8 text-center">
          <Link href="/projects">
            <Button variant="outline" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </Container>
    </>
  );
}
