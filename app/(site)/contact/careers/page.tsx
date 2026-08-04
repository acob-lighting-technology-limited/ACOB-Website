import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  ArrowRight,
  Calendar,
  MapPin as LocationIcon,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { whyWorkItems } from '@/lib/data/contact-data';
import { getJobPostings } from '@/sanity/lib/queries';
import { FadeIn } from '@/components/animations/FadeIn';
import {
  QuickContact,
  MoreContactOptions,
} from '@/components/contact/contact-sidebar';

export const revalidate = 300;

interface JobPosting {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  description?: string;
  applicationDeadline?: string;
  slug: { current: string };
}

export default async function CareersPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers' },
  ];

  const jobPostings = await getJobPostings();

  return (
    <>
      <Hero
        title="Careers"
        description="Build What Powers Nigeria."
        image="/images/contact/careers.webp?height=400&width=1200"
        titleSize="display"
      />

      <Container className="px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-8 md:mb-12" />

        {/* Standfirst */}
        <div className="max-w-[68ch]">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-primary">
            Join the team
          </span>
          <p className="mt-4 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
            Our people are our greatest asset — a mission-driven team at the
            forefront of Nigeria&apos;s clean energy revolution.
          </p>
          <p className="mt-5 max-w-[70ch] text-lg leading-relaxed text-muted-foreground">
            We offer a collaborative environment where creativity is encouraged
            and professional growth is prioritized. If you are passionate about
            making a tangible difference and contributing to a brighter, more
            sustainable future, explore career opportunities with us.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-10 border-t-[3px] border-foreground pt-10 lg:grid-cols-[1fr_300px] lg:gap-14 md:mt-16">
          {/* Main column */}
          <div className="space-y-14 md:space-y-20">
            {/* Why work here */}
            <section>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                Our culture
              </span>
              <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-3xl">
                Why work at ACOB Lighting?
              </h2>

              <div className="mt-8 border-t border-border">
                {whyWorkItems.map(({ title, description }, index) => (
                  <FadeIn
                    key={title}
                    delay={index * 0.08}
                    className="grid grid-cols-[48px_1fr] gap-x-5 border-b border-border py-6 md:grid-cols-[72px_1fr] md:gap-x-8"
                  >
                    <div className="text-2xl font-extrabold leading-none tabular-nums text-primary md:text-3xl">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="max-w-[62ch]">
                      <h3 className="text-lg font-extrabold tracking-tight text-foreground md:text-xl">
                        {title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </section>

            {/* Openings */}
            <section>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-primary">
                Opportunities
              </span>
              <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-foreground md:text-3xl">
                {jobPostings.length > 0
                  ? 'Current openings'
                  : 'Career opportunities'}
              </h2>

              {jobPostings.length > 0 ? (
                <div className="mt-8 border-t border-border">
                  {jobPostings.map((job: JobPosting) => (
                    <article
                      key={job._id}
                      className="border-b border-border py-7 md:py-8"
                    >
                      <h3 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                        {job.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {job.department && (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-primary" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <LocationIcon className="h-4 w-4 text-primary" />
                            {job.location}
                          </span>
                        )}
                        {job.employmentType && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" />
                            {job.employmentType}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="mt-4 max-w-[64ch] leading-relaxed text-muted-foreground">
                          {job.description}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link
                          href={`/contact/careers/${job.slug.current}`}
                          className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold text-foreground transition-all hover:gap-3 hover:border-primary hover:text-primary"
                        >
                          View details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        {job.applicationDeadline && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Deadline:{' '}
                            {new Date(
                              job.applicationDeadline,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-8 border-y border-border py-12">
                  <p className="text-3xl font-extrabold uppercase tracking-tight text-foreground md:text-4xl">
                    No current openings
                  </p>
                  <p className="mt-4 max-w-[64ch] text-lg leading-relaxed text-muted-foreground">
                    We don&apos;t have any open positions right now, but
                    we&apos;re always looking for talented people who are
                    passionate about clean energy and innovation. Check back
                    regularly, or reach out directly to express interest in
                    future roles.
                  </p>
                  <Link
                    href="/contact"
                    className="group mt-6 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold text-foreground transition-all hover:gap-3 hover:border-primary hover:text-primary"
                  >
                    Contact us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10 lg:sticky lg:top-24">
            <QuickContact emailAudience="careers" phones="both" showAddress />
            <MoreContactOptions excludeHref="/contact/careers" />
          </aside>
        </div>
      </Container>
    </>
  );
}
