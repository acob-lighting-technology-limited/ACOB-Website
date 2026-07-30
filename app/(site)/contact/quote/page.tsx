import { Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CONTACT_INFO } from '@/lib/constants/app.constants';

export default function GetQuotePage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Get a Quote' },
  ];

  return (
    <>
      <Hero
        title="Get a Quote"
        description="Let's Talk Numbers."
        image="/images/contact/contact-us.webp?height=400&width=1200"
        titleSize="display"
      />

      <Container className="px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-8 md:mb-12" />

        {/* Standfirst */}
        <div className="max-w-[68ch]">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-primary">
            Request a quote
          </span>
          <p className="mt-4 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
            Our online quote form is being rebuilt. In the meantime, reach out
            directly and our team will get back to you with a customized quote
            for your mini-grid, street lighting, or energy audit needs.
          </p>
        </div>

        {/* Contact rows */}
        <div className="mt-12 max-w-2xl border-t-[3px] border-foreground pt-4 md:mt-16">
          <div className="grid grid-cols-[44px_1fr] gap-x-5 border-b border-border py-6 md:grid-cols-[60px_1fr]">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Phone
              </span>
              <p className="mt-1">
                <a
                  href={`tel:${CONTACT_INFO.phone.primary.replace(/\s/g, '')}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {CONTACT_INFO.phone.primary}
                </a>
                <span className="mx-2 text-muted-foreground">·</span>
                <a
                  href={`tel:${CONTACT_INFO.phone.secondary.replace(/\s/g, '')}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {CONTACT_INFO.phone.secondary}
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[44px_1fr] gap-x-5 border-b border-border py-6 md:grid-cols-[60px_1fr]">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <p className="mt-1">
                <a
                  href={`mailto:${CONTACT_INFO.email.sales}`}
                  className="break-all font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {CONTACT_INFO.email.sales}
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[44px_1fr] gap-x-5 border-b border-border py-6 md:grid-cols-[60px_1fr]">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Address
              </span>
              <p className="mt-1 font-semibold leading-relaxed text-foreground">
                {CONTACT_INFO.address.full}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
