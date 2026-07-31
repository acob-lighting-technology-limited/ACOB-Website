'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/FadeIn';
import type { UpdatePost } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';

interface UpdatesSectionProps {
  posts: UpdatePost[];
}

function authorName(author: UpdatePost['author']): string {
  if (typeof author === 'string') {
    return author;
  }
  return (author as { name?: string })?.name || 'ACOB Lighting';
}

export function UpdatesSection({ posts }: UpdatesSectionProps) {
  const latestPosts = posts?.slice(0, 3) ?? [];

  if (!posts || posts.length === 0) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-zinc-950 transition-colors duration-500">
        <Container className="px-4">
          <div className="text-center">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto max-w-md mb-4" />
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto max-w-2xl mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-zinc-950 transition-all duration-500">
      <Container className="px-4">
        {/* Header */}
        <FadeIn delay={0.1}>
          <div className="mb-10 text-center md:mb-14">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
              News &amp; Announcements
            </span>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Recent Updates.
            </h2>
          </div>
        </FadeIn>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {latestPosts.map((post, index) => (
            <FadeIn
              key={post._id}
              delay={index * 0.08}
              direction="up"
              className="h-full"
            >
              <Link
                href={`/updates/${post.slug.current}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-sm text-muted-foreground">
                          No image available
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/90">
                      {post.category || 'News'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <div className="mb-2 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{authorName(post.author)}</span>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight text-foreground line-clamp-2 md:text-lg">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3 md:text-sm">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary md:text-sm">
                      Read more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 md:h-4 md:w-4" />
                    </span>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* View All */}
        <FadeIn delay={0.25}>
          <div className="mt-12 text-center">
            <Link href="/updates">
              <Button className="px-8 py-3">
                View All Updates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
