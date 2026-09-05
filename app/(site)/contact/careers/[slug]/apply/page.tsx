import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { JobApplicationForm } from '@/components/job-application-form';
import { getJobPosting } from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import { isDeadlinePassed, formatDate } from '@/lib/utils/date';
import Link from 'next/link';

interface ApplyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await getJobPosting(slug);

  if (!job) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/contact/careers' },
    { label: job.title, href: `/contact/careers/${slug}` },
    { label: 'Apply' },
  ];

  const isClosed = !job.isActive || isDeadlinePassed(job.applicationDeadline);

  if (isClosed) {
    return (
      <>
        <Hero
          title="Applications Closed"
          description={job.title}
          image="/images/contact/careers.webp?height=400&width=1200"
          titleSize="display"
        />

        <div className="pt-8">
          <Container className="px-4 py-12">
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
            <div className="max-w-xl border-l-4 border-destructive bg-muted/50 p-6 md:p-8">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
                This position is no longer accepting applications
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The application window for <strong>{job.title}</strong> has
                closed
                {job.applicationDeadline
                  ? ` on ${formatDate(job.applicationDeadline)}`
                  : ''}
                . Please check our Careers page for future openings.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/contact/careers"
                  className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  View all careers
                </Link>
                <Link
                  href={`/contact/careers/${slug}`}
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
                >
                  View job details
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero
        title="Apply Now"
        description={job.title}
        image="/images/contact/careers.webp?height=400&width=1200"
        titleSize="display"
      />

      <div className="pt-8">
        <Container className="px-4">
          <Breadcrumb items={breadcrumbItems} className="mb-8" />
        </Container>
        <JobApplicationForm jobTitle={job.title} jobSlug={slug} />
      </div>
    </>
  );
}
