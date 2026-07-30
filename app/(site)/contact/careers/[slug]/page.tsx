import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobPosting } from '@/sanity/lib/queries';
import { CONTACT_INFO } from '@/lib/constants/app.constants';

interface JobPostingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JobPostingPage({ params }: JobPostingPageProps) {
  const { slug } = await params;

  const job = await getJobPosting(slug);

  if (!job) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/contact/careers' },
    { label: job.title },
  ];

  return (
    <>
      <Hero
        title="Careers"
        description={job.title}
        image="/images/contact/careers.webp?height=400&width=1200"
        titleSize="display"
      />

      <Container className="px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-8 md:mb-12" />

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
          {/* Main content */}
          <div>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
              {job.department && (
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {job.location}
                </span>
              )}
              {job.employmentType && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {job.employmentType}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                The role
              </span>
              <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-3xl">
                Job description
              </h2>
              <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-foreground/90">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-12">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                  What we&apos;re looking for
                </span>
                <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-3xl">
                  Requirements
                </h2>
                <div className="mt-6 border-t border-border">
                  {job.requirements.map(
                    (requirement: string, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-[36px_1fr] gap-x-4 border-b border-border py-4"
                      >
                        <span className="text-sm font-extrabold tabular-nums text-primary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="max-w-[64ch] leading-relaxed text-muted-foreground">
                          {requirement}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Deadline */}
            {job.applicationDeadline && (
              <div className="mt-10 flex items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong className="font-semibold text-foreground">
                    Application deadline:
                  </strong>{' '}
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row">
              <Link href="/contact/careers">
                <Button variant="outline" className="group w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Careers
                </Button>
              </Link>
              <Link href={`/contact/careers/${slug}/apply`}>
                <Button className="group w-full sm:w-auto">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10 lg:sticky lg:top-24">
            <section>
              <div className="border-t-2 border-foreground pt-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                  Apply for this Position
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Interested in this role? Get in touch with us to apply.
              </p>
              <div className="mt-4 divide-y divide-border border-y border-border">
                <div className="py-3.5">
                  <div className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    Email
                  </div>
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    <a
                      href={`mailto:${CONTACT_INFO.email.careers}`}
                      className="break-all text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {CONTACT_INFO.email.careers}
                    </a>
                    <a
                      href={`mailto:${CONTACT_INFO.email.secondary}`}
                      className="break-all text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {CONTACT_INFO.email.secondary}
                    </a>
                  </div>
                </div>
                <div className="py-3.5">
                  <div className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Phone
                  </div>
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    <a
                      href={`tel:${CONTACT_INFO.phone.primary.replace(/\s/g, '')}`}
                      className="text-sm font-semibold tabular-nums text-foreground hover:text-primary"
                    >
                      {CONTACT_INFO.phone.primary}
                    </a>
                    <a
                      href={`tel:${CONTACT_INFO.phone.secondary.replace(/\s/g, '')}`}
                      className="text-sm font-semibold tabular-nums text-foreground hover:text-primary"
                    >
                      {CONTACT_INFO.phone.secondary}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="border-t-2 border-foreground pt-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                  Job Summary
                </h2>
              </div>
              <div className="mt-4 divide-y divide-border border-y border-border">
                {job.department && (
                  <div className="py-3.5">
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Department
                    </span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {job.department}
                    </p>
                  </div>
                )}
                {job.location && (
                  <div className="py-3.5">
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Location
                    </span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {job.location}
                    </p>
                  </div>
                )}
                {job.employmentType && (
                  <div className="py-3.5">
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Type
                    </span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {job.employmentType}
                    </p>
                  </div>
                )}
                {job.publishedAt && (
                  <div className="py-3.5">
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Posted
                    </span>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                      {new Date(job.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </>
  );
}
