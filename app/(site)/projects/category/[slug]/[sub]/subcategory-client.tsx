'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Project, PaginationInfo } from '@/lib/types';
import { extractTextFromPortableText } from '@/lib/utils';
import { applySanityImagePreset } from '@/lib/utils/sanity-image';
import { FadeIn } from '@/components/animations/FadeIn';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CardSkeleton, QueryError } from '@/components/ui/query-states';
import { CategorySearch } from '../category-search';

const PAGE_LIMIT = 9;

interface SubcategoryClientProps {
  categorySlug: string;
  subSlug: string;
  categoryTitle: string;
  subTitle: string;
  subDescription: string;
  fallbackImage: string;
  initialProjects: Project[];
  initialPagination: PaginationInfo;
  currentSearch: string;
  breadcrumbItems: Array<{ label: string; href?: string }>;
}

export default function SubcategoryClient({
  categorySlug,
  subSlug,
  categoryTitle,
  subTitle,
  subDescription,
  fallbackImage,
  initialProjects,
  initialPagination,
  currentSearch,
  breadcrumbItems,
}: SubcategoryClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pagination, setPagination] =
    useState<PaginationInfo>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const heroImages = useMemo(
    () =>
      projects
        .filter(p => p.projectImage)
        .map(p => ({
          src: p.projectImage!,
          alt: p.title,
          href: `/projects/${p.slug.current}`,
        })),
    [projects],
  );

  const fetchPage = useCallback(
    async (page: number) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const urlParams = new URLSearchParams();
      if (currentSearch.trim()) {
        urlParams.set('search', currentSearch);
      }
      if (page > 1) {
        urlParams.set('page', page.toString());
      }
      const qs = urlParams.toString();
      const basePath = `/projects/category/${categorySlug}/${subSlug}`;
      window.history.replaceState(
        null,
        '',
        qs ? `${basePath}?${qs}` : basePath,
      );

      try {
        const apiParams = new URLSearchParams();
        if (currentSearch.trim()) {
          apiParams.set('search', currentSearch);
        }
        if (page > 1) {
          apiParams.set('page', page.toString());
        }
        apiParams.set('limit', String(PAGE_LIMIT));

        const res = await fetch(
          `/api/projects/category/${categorySlug}/${subSlug}?${apiParams.toString()}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          throw new Error('Failed to fetch projects');
        }
        const result = await res.json();

        setProjects(result.projects);
        setPagination(result.pagination);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError('Could not load projects.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [categorySlug, subSlug, currentSearch],
  );

  const handlePageChange = (page: number) => {
    fetchPage(page);
  };

  if (error) {
    return (
      <QueryError
        message={error}
        onRetry={() => fetchPage(pagination.currentPage)}
      />
    );
  }

  const heroImage = heroImages.length > 0 ? heroImages : fallbackImage;

  return (
    <>
      <Hero
        description={subDescription}
        image={heroImage}
        title={`${categoryTitle} — ${subTitle}`}
      />

      <Container className="px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Breadcrumb items={breadcrumbItems} />
          <CategorySearch initialSearch={currentSearch} />
        </div>

        {isLoading ? (
          <CardSkeleton count={PAGE_LIMIT} />
        ) : projects.length === 0 ? (
          <Card className="!border-t-2 !border-t-primary border border-border">
            <CardContent className="p-4 sm:p-6 xl:p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  No projects found
                </h3>
                <p>No projects available in this sub-category yet.</p>
              </div>
              <Link href={`/projects/category/${categorySlug}`}>
                <Button variant="outline">View All {categoryTitle}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project: Project, index: number) => (
                <FadeIn key={project._id} delay={index * 0.05} direction="up">
                  <Link
                    href={`/projects/${project.slug.current}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border hover:border-primary/50">
                      <div className="aspect-[16/9] overflow-hidden relative bg-muted">
                        {project.projectImage ? (
                          <Image
                            src={applySanityImagePreset(
                              project.projectImage,
                              'card',
                            )}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">
                              No image
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                          {(project.location || project.state) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              <span>
                                {project.location}
                                {project.location && project.state && ', '}
                                {project.state &&
                                  (project.state.toUpperCase() === 'FCT'
                                    ? 'FCT'
                                    : `${project.state} State`)}
                              </span>
                            </div>
                          )}
                          {project.projectDate && (
                            <div className="flex items-center gap-1">
                              <span>
                                {new Date(project.projectDate).getFullYear()}
                              </span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-3">
                          {project.title}
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
                          {project.excerpt ||
                            extractTextFromPortableText(
                              project.content || [],
                            ) ||
                            'Project details coming soon...'}
                        </p>

                        <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all duration-300">
                          View Project
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </FadeIn>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <div className="text-sm text-center text-muted-foreground mb-6">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>
                  -
                  <span className="font-medium text-foreground">
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount,
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {pagination.totalCount}
                  </span>{' '}
                  projects
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            Math.max(1, pagination.currentPage - 1),
                          )
                        }
                        disabled={pagination.currentPage === 1}
                        className={
                          pagination.currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                        size="default"
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    ).map(page => {
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 1 &&
                          page <= pagination.currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={pagination.currentPage === page}
                              className="cursor-pointer"
                              size="default"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === pagination.currentPage - 2 ||
                        page === pagination.currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(
                              pagination.totalPages,
                              pagination.currentPage + 1,
                            ),
                          )
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className={
                          pagination.currentPage === pagination.totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                        size="default"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}
