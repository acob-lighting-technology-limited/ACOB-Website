import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Star,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { getServiceBySlug, servicesData } from '@/lib/data';
import Link from 'next/link';
import { Hero } from '@/components/ui/hero';
import { ServiceGallery } from '@/components/services/service-gallery';
import { ShareCopy } from '@/components/updates/share-copy';
import Image from 'next/image';
import { FadeIn } from '@/components/animations/FadeIn';
import { client } from '@/sanity/lib/queries';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return servicesData.map(service => ({
    slug: service.slug,
  }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: service.title },
  ];

  // Get related services (excluding current service)
  const relatedServices = servicesData.filter(s => s.slug !== slug).slice(0, 3);

  // Fetch all projects to match with key deployments
  let projects: Array<{ title: string; slug: { current: string } }> = [];
  try {
    projects = await client.fetch('*[_type == "project"]{ title, slug }');
  } catch (e) {
    console.error(
      'Failed to fetch projects for service deployments matching:',
      e,
    );
  }

  // Helper to match deployment name to Sanity project
  const findMatchingProject = (deploymentName: string) => {
    const cleanSearchTerm = (name: string) => {
      let cleaned = name.toLowerCase();
      if (cleaned.includes('akth')) {
        return 'aminu kano';
      }
      if (cleaned.includes('idh')) {
        return 'infectious disease';
      }
      if (cleaned.includes('wase')) {
        return 'wase';
      }
      if (cleaned.includes('sanusi')) {
        return 'sanusi';
      }
      if (cleaned.includes('kazaure')) {
        return 'kazaure';
      }
      if (cleaned.includes('babura')) {
        return 'babura';
      }
      if (cleaned.includes('hadejia')) {
        return 'hadejia';
      }
      if (cleaned.includes('rasheed')) {
        return 'rasheed';
      }
      if (cleaned.includes('gwantu')) {
        return 'gwantu';
      }
      if (cleaned.includes('ikara')) {
        return 'ikara';
      }
      if (cleaned.includes('yakowa') || cleaned.includes('kafanchan')) {
        return 'yakowa';
      }

      cleaned = cleaned
        .replace(
          /\b(community|hospital|general|teaching|zonal|specialist|facility|site|sites|headquarters|utility|suite|bank|home)\b/g,
          '',
        )
        .replace(/,/g, '')
        .trim();
      return cleaned;
    };

    const term = cleanSearchTerm(deploymentName);
    if (!term) {
      return null;
    }

    return projects.find(proj => {
      const titleLower = proj.title.toLowerCase();
      return titleLower.includes(term);
    });
  };

  // Parse narrative vs completed projects list
  const descParts = service.description.split(
    /We have successfully[\s\S]*?including:/i,
  );
  const introText = descParts[0].trim();
  const projectsSection = descParts[1] ? descParts[1].trim() : '';

  // Extract individual bullet points
  const completedProjects = projectsSection
    ? projectsSection
        .split('\n')
        .map(line => line.replace(/^•\s*/, '').trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <Hero
        title="Our Services"
        description={service.title}
        image={service.image}
      />
      <Container className="py-12">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-8 items-start">
          {/* Left Column: Narrative, Gallery & Key Deployments */}
          <div className="space-y-10">
            <FadeIn delay={0.1}>
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4 py-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-primary">
                    Service Overview
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                    {service.title}
                  </h1>
                </div>

                <p className="text-muted-foreground dark:text-foreground/90 leading-relaxed text-lg whitespace-pre-line">
                  {introText}
                </p>
              </div>
            </FadeIn>

            {/* Inline Mixed Portfolio Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <FadeIn delay={0.2}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Project Portfolio Gallery
                  </h3>
                  <ServiceGallery
                    images={service.gallery}
                    serviceTitle={service.title}
                  />
                </div>
              </FadeIn>
            )}

            {/* Key Completed Deployments (Stylized Timeline/Grid) */}
            {completedProjects.length > 0 && (
              <FadeIn delay={0.3}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Key Completed Deployments
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {completedProjects.map((proj, idx) => {
                      const colonIdx = proj.indexOf(':');
                      let name = proj;
                      let detail = '';
                      if (colonIdx !== -1) {
                        name = proj.substring(0, colonIdx).trim();
                        detail = proj.substring(colonIdx + 1).trim();
                      }
                      const matchingProject = findMatchingProject(name);

                      const CardContent = (
                        <>
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 flex-1 text-left">
                            <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {name}
                              {matchingProject && (
                                <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5" />
                              )}
                            </h4>
                            {detail && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {detail}
                              </p>
                            )}
                          </div>
                        </>
                      );

                      return matchingProject ? (
                        <Link
                          href={`/projects/${matchingProject.slug.current}`}
                          key={idx}
                          className="group flex gap-4 p-5 rounded-xl border border-border/80 bg-card/45 hover:bg-card hover:border-primary/45 hover:shadow-md transition-all duration-300 cursor-pointer w-full"
                        >
                          {CardContent}
                        </Link>
                      ) : (
                        <div
                          key={idx}
                          className="flex gap-4 p-5 rounded-xl border border-border/80 bg-card/45 transition-all duration-300 w-full"
                        >
                          {CardContent}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column: Features, Benefits, Applications & Why Choose Us */}
          <div className="space-y-8 lg:sticky lg:top-24">
            {/* Features Card */}
            {service.features && service.features.length > 0 && (
              <FadeIn delay={0.15}>
                <Card className="border border-border bg-card/45 shadow-sm overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {service.features.map((feat, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-muted-foreground dark:text-foreground/90"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Benefits & Impact Card */}
            {service.benefits && service.benefits.length > 0 && (
              <FadeIn delay={0.25}>
                <Card className="border border-border bg-card/45 shadow-sm overflow-hidden">
                  <CardHeader className="bg-emerald-500/5 pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Star className="h-5 w-5" />
                      Value & Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {service.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-muted-foreground dark:text-foreground/90"
                        >
                          <Star className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Applications Tags */}
            {service.applications && service.applications.length > 0 && (
              <FadeIn delay={0.35}>
                <Card className="border border-border bg-card/45 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      Target Applications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.applications.map((app, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="px-3 py-1 text-xs font-semibold"
                        >
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Why Choose ACOB */}
            {service.whyChooseUs && service.whyChooseUs.length > 0 && (
              <FadeIn delay={0.45}>
                <Card className="border border-border bg-card/45 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      Why Choose ACOB
                    </h4>
                    <ul className="space-y-3 text-sm text-muted-foreground dark:text-foreground/90">
                      {service.whyChooseUs.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary font-extrabold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="flex items-center gap-4 py-8 border-t border-b border-border/60 mt-12">
          <span className="text-sm font-semibold text-muted-foreground">
            Share this Service:
          </span>
          <ShareCopy className="rounded-full bg-transparent" />
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Related Services</h3>
              <Link
                href="/services"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedServices.map(relatedService => (
                <Link
                  key={relatedService.id}
                  href={`/services/${relatedService.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    <Image
                      src={relatedService.image}
                      alt={relatedService.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                      {relatedService.title}
                    </h4>
                    {relatedService.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {relatedService.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60 text-xs text-primary font-medium group-hover:gap-2 transition-all duration-300">
                      <span>Learn More</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Services Button */}
        <div className="mt-12 mb-8 text-center">
          <Link href="/services">
            <Button variant="outline" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Services
            </Button>
          </Link>
        </div>
      </Container>
    </>
  );
}
