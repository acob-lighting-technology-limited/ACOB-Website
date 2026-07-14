import { Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/ui/hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
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
        description="Talk to our team directly for a customized solar energy quote."
        image="/images/contact/contact-us.webp?height=400&width=1200"
      />

      <Container className="px-4 py-16 sm:py-20">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardContent className="p-8 sm:p-12">
              <h1 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
                Request a Quote
              </h1>
              <p className="mb-8 text-muted-foreground">
                Our online quote form is being rebuilt. In the meantime, reach
                out directly and our team will get back to you with a customized
                quote for your mini-grid, street lighting, or energy audit
                needs.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${CONTACT_INFO.phone.primary.replace(/\s/g, '')}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {CONTACT_INFO.phone.primary}
                    </a>
                    {' · '}
                    <a
                      href={`tel:${CONTACT_INFO.phone.secondary.replace(/\s/g, '')}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {CONTACT_INFO.phone.secondary}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${CONTACT_INFO.email.sales}`}
                      className="font-semibold text-primary hover:underline break-all"
                    >
                      {CONTACT_INFO.email.sales}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold leading-relaxed">
                      {CONTACT_INFO.address.full}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
