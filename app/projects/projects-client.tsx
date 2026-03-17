'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import Image from 'next/image';
import { MapPin, ArrowRight, Search, X } from 'lucide-react';
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

const PAGE_LIMIT = 9;

interface ProjectsClientProps {
  initialProjects: Project[];
  initialPagination: PaginationInfo;
  currentSearch: string;
  breadcrumbItems: Array<{ label: string; href?: string }>;
}

export default function ProjectsClient({
  initialProjects,
  initialPagination,
  currentSearch,
  breadcrumbItems,
}: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pagination, setPagination] =
    useState<PaginationInfo>(initialPagination);
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [hasSearched, setHasSearched] = useState(!!currentSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const fetchPage = useCallback(async (search: string, page: number) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Immediately show loading + scroll to top
    setIsLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without Next.js navigation
    const urlParams = new URLSearchParams();
    if (search.trim()) {
      urlParams.set('search', search);
    }
    if (page > 1) {
      urlParams.set('page', page.toString());
    }
    const qs = urlParams.toString();
    window.history.replaceState(null, '', qs ? `/projects?${qs}` : '/projects');

    try {
      const apiParams = new URLSearchParams();
      if (search.trim()) {
        apiParams.set('search', search);
      }
      if (page > 1) {
        apiParams.set('page', page.toString());
      }
      apiParams.set('limit', String(PAGE_LIMIT));

      const res = await fetch(`/api/projects?${apiParams.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      const result = await res.json();

      setProjects(result.projects);
      setPagination(result.pagination);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      } // Cancelled, ignore
      setError('Could not load projects.');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearchSubmit = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setHasSearched(true);
    fetchPage(searchQuery, 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handlePageChange = (page: number) => {
    fetchPage(searchQuery, page);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    fetchPage('', 1);
  };

  if (error) {
    return (
      <QueryError
        message={error}
        onRetry={() => fetchPage(searchQuery, pagination.currentPage)}
      />
    );
  }

  return (
    <>
      <Hero
        image={heroImages}
        title="Our Projects"
        description="Delivering Reliable Solar Energy Infrastructure Across Nigeria"
      />

      <Container className="px-4 py-8">
        {/* Breadcrumb with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="relative w-full sm:w-auto sm:min-w-[400px] flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-11 pl-10 pr-10 bg-background border-2 focus:border-primary transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearchSubmit}
              size="lg"
              className="h-11 px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && hasSearched && !isLoading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-card border border-border rounded-md px-3 py-2">
              <p>
                <span className="font-medium text-foreground">
                  {pagination.totalCount}
                </span>{' '}
                project{pagination.totalCount !== 1 ? 's' : ''} found for{' '}
                <span className="font-medium text-foreground">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </p>
              <button
                onClick={handleClearSearch}
                className="text-xs hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <CardSkeleton count={PAGE_LIMIT} />
        ) : projects.length === 0 ? (
          <Card className="!border-t-2 !border-t-primary border border-border">
            <CardContent className="p-4 sm:p-6 xl:p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No projects found
                </h3>
                <p>Try adjusting your search terms or browse all projects.</p>
              </div>
              <Button variant="outline" onClick={handleClearSearch}>
                View All Projects
              </Button>
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
                                    : `${project.state} State.`)}
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
                            extractTextFromPortableText(project.content || [])}
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

            {/* Pagination */}
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
