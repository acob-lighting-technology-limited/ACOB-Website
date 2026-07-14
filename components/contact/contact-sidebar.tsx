import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CONTACT_INFO } from '@/lib/constants/app.constants';
import { contactLinks } from '@/lib/data/contact-data';

interface QuickContactProps {
  /** Which email address to lead with (secondary email is always shown too). */
  emailAudience?: 'careers' | 'support' | 'general';
  /** Show both phone numbers, or just the primary one. */
  phones?: 'primary' | 'both';
  showAddress?: boolean;
  showHours?: boolean;
}

/** "Quick Contact" sidebar card — phone/email, optionally address/hours. */
export function QuickContact({
  emailAudience = 'general',
  phones = 'both',
  showAddress = false,
  showHours = false,
}: QuickContactProps) {
  const primaryEmail =
    emailAudience === 'careers'
      ? CONTACT_INFO.email.careers
      : emailAudience === 'support'
        ? CONTACT_INFO.email.support
        : CONTACT_INFO.email.general;

  return (
    <Card className="!border-t-2 !border-t-primary border border-border">
      <CardContent className="p-4 md:p-5 lg:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
          Quick Contact
        </h3>
        <div className="space-y-2.5 md:space-y-3">
          <div className="p-2.5 md:p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Phone</p>
            <div className="space-y-1">
              <a
                href={`tel:${CONTACT_INFO.phone.primary.replace(/\s/g, '')}`}
                className="text-xs md:text-sm font-semibold text-primary hover:underline block"
              >
                {CONTACT_INFO.phone.primary}
              </a>
              {phones === 'both' && (
                <a
                  href={`tel:${CONTACT_INFO.phone.secondary.replace(/\s/g, '')}`}
                  className="text-xs md:text-sm font-semibold text-primary hover:underline block"
                >
                  {CONTACT_INFO.phone.secondary}
                </a>
              )}
            </div>
          </div>
          <div className="p-2.5 md:p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <div className="space-y-1">
              <a
                href={`mailto:${primaryEmail}`}
                className="text-xs md:text-sm font-semibold text-primary hover:underline block break-all"
              >
                {primaryEmail}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email.secondary}`}
                className="text-xs md:text-sm font-semibold text-primary hover:underline block break-all"
              >
                {CONTACT_INFO.email.secondary}
              </a>
            </div>
          </div>
          {showAddress && (
            <div className="p-2.5 md:p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="text-xs md:text-sm font-semibold leading-relaxed">
                {CONTACT_INFO.address.full}
              </p>
            </div>
          )}
          {showHours && (
            <div className="p-2.5 md:p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Business Hours
              </p>
              <p className="text-xs md:text-sm font-semibold">
                {CONTACT_INFO.workHours.weekdays}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MoreContactOptionsProps {
  /** Omit the link pointing back at the current page. */
  excludeHref?: string;
}

/** "More Contact Options" sidebar card — links to the other contact sub-pages. */
export function MoreContactOptions({ excludeHref }: MoreContactOptionsProps) {
  const links = contactLinks.filter(link => link.href !== excludeHref);

  return (
    <Card className="border border-border">
      <CardContent className="p-4 md:p-5 lg:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
          More Contact Options
        </h3>
        <div className="space-y-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block p-2.5 md:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-500 text-xs md:text-sm font-medium border border-border group"
            >
              <div className="flex items-center justify-between">
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
