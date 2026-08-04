import { ComingSoon } from '@/components/ui/coming-soon';

export default function GetQuotePage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Get a Quote' },
  ];

  return (
    <ComingSoon
      title="Get a Quote"
      description="We're updating our online quote form. This page will be available soon!"
      breadcrumbItems={breadcrumbItems}
      backgroundImage="/images/contact/contact-us.webp?height=400&width=1200"
      backHref="/contact"
      backLabel="Back to Contact"
    />
  );
}
