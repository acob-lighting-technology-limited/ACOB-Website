import type React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ChatBot } from '@/components/features/chat-bot';
import { ChatErrorBoundary } from '@/components/error-boundary/error-boundary';
import { SkipNavigation } from '@/components/ui/skip-navigation';
import { AnnouncementBanner } from '@/components/ui/announcement-banner';
import { getJobPostings, getProducts } from '@/sanity/lib/queries';

export const revalidate = 300;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobPostings, products] = await Promise.all([
    getJobPostings(),
    getProducts(),
  ]);

  return (
    <div className="flex min-h-screen flex-col w-full bg-background transition-colors duration-500 selection:bg-primary selection:text-primary-foreground">
      <SkipNavigation />
      <AnnouncementBanner
        jobCount={jobPostings.length}
        productCount={products.length}
      />
      <Header />
      <main id="main-content" className="flex-1 border-b border-b-muted">
        {children}
      </main>
      <Footer />
      <div className="z-50 fixed -bottom-2 right-0 flex flex-col gap-2 items-center w-16 h-32 sm:w-20 sm:h-40">
        <ScrollToTop />
        <ChatErrorBoundary>
          <ChatBot />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}
