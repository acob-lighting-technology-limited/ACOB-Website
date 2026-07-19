import Link from 'next/link';
import Image from 'next/image';

import {
  getUpdatePosts,
  getUpdatePost,
  getApprovedCommentsForPost,
  getRelatedUpdatePosts,
} from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import type { UpdatePost, Comment } from '@/lib/types';
import { Container } from '@/components/ui/container';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Calendar, MessageSquare } from 'lucide-react';
import { ShareCopy } from '@/components/updates/share-copy';
import { CommentForm } from '@/components/updates/comment-form';
import { Hero } from '@/components/ui/hero';
import { UpdateContent } from './update-content';

interface UpdatePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getUpdatePosts();
  return posts
    .filter((post: UpdatePost) => post.slug && post.slug.current)
    .map((post: UpdatePost) => ({
      slug: post.slug.current,
    }));
}

// Revalidate every 5 minutes (300 seconds) — balances freshness with API quota
export const revalidate = 300;

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug } = await params;

  // Handle individual post page
  const post = await getUpdatePost(slug);
  if (!post) {
    notFound();
  }

  // Fetch comments and related posts
  const comments = await getApprovedCommentsForPost(post._id);
  const related = await getRelatedUpdatePosts(post.category || 'news', slug, 3);

  // Format category name for display
  const formatCategoryName = (category: string | undefined): string => {
    if (!category) {
      return 'Updates';
    }
    const categoryMap: Record<string, string> = {
      news: 'News',
      'case-studies': 'Case Studies',
      'press-releases': 'Press Releases',
      announcements: 'Announcements',
      events: 'Events',
      celebrations: 'Celebrations',
    };
    return (
      categoryMap[category] ||
      category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  const categoryTitle = formatCategoryName(post.category);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Updates', href: '/updates' },
    { label: post.title },
  ];

  return (
    <>
      <Hero
        title={categoryTitle}
        description={post.title}
        image={post.featuredImage}
      />

      <Container className="px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        <Card className="pt-2">
          <CardContent className="p-4 sm:p-6 xl:p-8 space-y-4 sm:space-y-6">
            {/* Post Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Overview
              </h1>
            </div>

            {/* Post Content - Wrapped in flex for image grid */}
            <UpdateContent content={post.content} />

            {/* Post Metadata */}
            <div className="flex items-center text-sm text-muted-foreground flex-wrap gap-2 pt-8 border-t">
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>
                {typeof post.author === 'string'
                  ? post.author
                  : (post.author as any)?.name || 'ACOB Lighting'}
              </span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                    {post.category === 'news'
                      ? 'News'
                      : post.category === 'case-studies'
                        ? 'Case Studies'
                        : post.category === 'press-releases'
                          ? 'Press Releases'
                          : post.category === 'announcements'
                            ? 'Announcements'
                            : post.category === 'events'
                              ? 'Events'
                              : post.category === 'celebrations'
                                ? 'Celebrations'
                                : post.category}
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 pt-8 border-t">
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                {post.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Share Buttons */}
            <div className="flex items-center gap-4 pt-8 border-t">
              <ShareCopy className="rounded-full bg-transparent" />
            </div>
          </CardContent>
        </Card>

        {/* Related Updates */}
        {Array.isArray(related) && related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Related Updates</h3>
              <Link
                href="/updates"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item: UpdatePost) => {
                const href = item?.slug?.current
                  ? `/updates/${item.slug.current}`
                  : null;

                if (!href) {
                  return null;
                }

                const categoryLabel = formatCategoryName(item.category);

                return (
                  <Link
                    key={item._id}
                    href={href}
                    className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 w-full bg-muted overflow-hidden">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title ?? ''}
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
                      {item.category && (
                        <div className="absolute top-3 left-3">
                          <Badge className="text-[10px] uppercase tracking-wide shadow">
                            {categoryLabel}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      {item.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60">
                        {item.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {new Date(item.publishedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                          Read
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to Updates Button */}
        <div className="mt-12 mb-8 text-center">
          <Link href="/updates">
            <Button variant="outline" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Updates
            </Button>
          </Link>
        </div>

        {/* Discussion Section */}
        <div className="mt-12">
          <Card className="border shadow-md border-border">
            <CardContent className="p-4 sm:p-6 xl:p-8 space-y-8">
              {/* Comments list */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Discussion
                    {comments.length > 0 && (
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({comments.length})
                      </span>
                    )}
                  </h2>
                </div>

                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment: Comment) => {
                      const initial = (comment.name || '?')
                        .charAt(0)
                        .toUpperCase();
                      const dateStr = new Date(
                        comment.createdAt,
                      ).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      return (
                        <div
                          key={comment._id}
                          className="flex gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur p-4 transition-colors hover:bg-white/70 dark:hover:bg-white/10"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {initial}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                {comment.name}
                              </p>
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                {dateStr}
                              </p>
                            </div>
                            <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border bg-muted/30">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No comments yet
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Be the first to share your thoughts below.
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Inline form */}
              <CommentForm postId={post._id} inline />
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
