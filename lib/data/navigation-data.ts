export interface NavSubSubItem {
  name: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavSubItem {
  name: string;
  href: string;
  description: string;
  icon: string;
  subItems?: NavSubSubItem[];
}

export interface NavItem {
  name: string;
  href: string;
  subItems: NavSubItem[];
}

const projectSubItems: NavSubItem[] = [
  {
    name: 'Rural Electrification',
    href: '/projects/category/rural-electrification',
    description: 'Bringing power to remote communities',
    icon: 'Home',
  },
  {
    name: 'Mini-Grids',
    href: '/projects/category/mini-grids',
    description: 'Community solar mini-grid systems',
    icon: 'Battery',
    subItems: [
      {
        name: 'Isolated',
        href: '/projects/category/mini-grids/isolated',
        description: 'Standalone off-grid mini-grids',
        icon: 'Home',
      },
      {
        name: 'Interconnected',
        href: '/projects/category/mini-grids/interconnected',
        description: 'Grid-connected mini-grids',
        icon: 'Handshake',
      },
    ],
  },
  {
    name: 'Commercial Installations',
    href: '/projects/category/commercial-installations',
    description: 'Solar solutions for buildings',
    icon: 'Building2',
    subItems: [
      {
        name: 'Residential',
        href: '/projects/category/commercial-installations/residential',
        description: 'Homes and residential estates',
        icon: 'Home',
      },
      {
        name: 'Commercial',
        href: '/projects/category/commercial-installations/commercial',
        description: 'Businesses and offices',
        icon: 'Building2',
      },
    ],
  },
  {
    name: 'Street Lighting',
    href: '/projects/category/street-lighting',
    description: 'Public lighting infrastructure projects',
    icon: 'Lightbulb',
  },
  {
    name: 'Healthcare Projects',
    href: '/projects/category/healthcare-projects',
    description: 'Powering hospitals and clinics',
    icon: 'Heart',
    subItems: [
      {
        name: 'Primary Healthcare',
        href: '/projects/category/healthcare-projects/primary',
        description: 'Clinics and primary health centres',
        icon: 'Stethoscope',
      },
      {
        name: 'Secondary Healthcare',
        href: '/projects/category/healthcare-projects/secondary',
        description: 'General and referral hospitals',
        icon: 'Hospital',
      },
      {
        name: 'Tertiary Healthcare',
        href: '/projects/category/healthcare-projects/tertiary',
        description: 'Teaching and specialist hospitals',
        icon: 'Building2',
      },
    ],
  },
  {
    name: 'Productive Use of Energy (PUE)',
    href: '/projects/category/pue',
    description: 'Productive use of energy projects',
    icon: 'Zap',
    subItems: [
      {
        name: 'EV Charging',
        href: '/projects/category/pue/ev-charging',
        description: 'Electric vehicle charging stations',
        icon: 'Battery',
      },
      {
        name: 'Irrigation',
        href: '/projects/category/pue/irrigation',
        description: 'Solar-powered irrigation systems',
        icon: 'Sun',
      },
      {
        name: 'CNG',
        href: '/projects/category/pue/cng',
        description: 'Compressed natural gas solutions',
        icon: 'Package',
      },
    ],
  },
];

export const navigationItems: NavItem[] = [
  {
    name: 'About Us',
    href: '/about',
    subItems: [
      {
        name: 'Our Story',
        href: '/about/our-story',
        description: 'Learn about our journey and how we started',
        icon: 'BookOpen',
        // icon: 'https://www.svgrepo.com/download/522469/book.svg',
      },
      {
        name: 'Mission & Vision',
        href: '/about/mission',
        description: 'Our commitment to sustainable energy',
        icon: 'Target',
        // icon: 'https://www.svgrepo.com/download/384034/dart-mission-goal-success.svg',
      },
      {
        name: 'Our Team',
        href: '/about/team',
        description: 'Meet the experts behind our success',
        icon: 'Users',
        // icon: 'https://www.svgrepo.com/download/60828/team.svg',
      },
      {
        name: 'Company Profile',
        href: '/about/profile',
        description: 'View our comprehensive company profile document',
        icon: 'FileText',
      },
      {
        name: 'Certifications',
        href: '/about/certifications',
        description: 'Our industry certifications and standards',
        icon: 'Award',
        // icon: 'https://www.svgrepo.com/download/121332/certification-file.svg',
      },
      {
        name: 'Partners',
        href: '/about/partners',
        description: 'Our trusted partners and collaborations',
        icon: 'Handshake',
      },
      {
        name: 'Our Reach',
        href: '/about/our-reach',
        description: 'See our footprint and project reach across Nigeria',
        icon: 'MapPin',
      },
    ],
  },
  {
    name: 'Services',
    href: '/services',
    subItems: [
      {
        name: 'Rural Mini-Grid Utilities',
        href: '/services/mini-grid-solutions',
        description: 'Scalable power solutions for communities',
        icon: 'Zap',
      },
      {
        name: 'Commercial & Industrial Captive Solar',
        href: '/services/captive-power-solutions',
        description: 'Dedicated power systems for businesses',
        icon: 'Lightbulb',
      },
      {
        name: 'Healthcare Solarization & Infrastructure',
        href: '/services/healthcare-solarization',
        description: 'Powering hospitals and clinical sites',
        icon: 'Heart',
      },
      {
        name: 'Productive Use of Energy (PUE)',
        href: '/services/productive-use-of-energy',
        description: 'Irrigation, EV charging, and clean tech',
        icon: 'Battery',
      },
      {
        name: 'Commercial Energy Auditing & Optimization',
        href: '/services/professional-energy-audit',
        description: 'Comprehensive energy efficiency analysis',
        icon: 'BarChart3',
      },
      {
        name: 'Smart Streetlighting Infrastructure',
        href: '/services/streetlighting-infrastructure',
        description: 'Public lighting and infrastructure projects',
        icon: 'Wrench',
      },
      {
        name: 'Operations & Maintenance (O&M) Utilities',
        href: '/services/operations-and-maintenance',
        description: '24/7 monitoring and proactive maintenance services',
        icon: 'Shield',
      },
    ],
  },
  {
    name: 'Projects',
    href: '/projects',
    subItems: projectSubItems,
  },
  {
    name: 'Updates & Media',
    href: '/updates',
    subItems: [
      {
        name: 'Announcements',
        href: '/updates/category/announcements',
        description: 'Company announcements and news',
        icon: 'Megaphone',
      },
      {
        name: 'Case Studies',
        href: '/updates/category/case-studies',
        description: 'Real-world implementation stories',
        icon: 'FileText',
      },
      {
        name: 'Press Releases',
        href: '/updates/category/press-releases',
        description: 'Official press releases and updates',
        icon: 'Newspaper',
      },
      {
        name: 'Events',
        href: '/updates/category/events',
        description: 'Upcoming and past events',
        icon: 'Calendar',
      },
      {
        name: 'Celebrations',
        href: '/updates/category/celebrations',
        description: 'Company milestones and celebrations',
        icon: 'Sparkles',
      },
      {
        name: 'Media Gallery',
        href: '/updates/gallery',
        description: 'Photos and videos from our projects',
        icon: 'Image',
      },
    ],
  },
  {
    name: 'Contact Us',
    href: '/contact',
    subItems: [
      {
        name: 'Office Locations',
        href: '/contact/locations',
        description: 'Find our offices near you',
        icon: 'MapPin',
        // icon: 'https://www.svgrepo.com/download/532539/location-pin.svg',
      },
      {
        name: 'Support',
        href: '/contact/support',
        description: 'Technical support and assistance',
        icon: 'MessageCircle',
        // icon: 'https://www.svgrepo.com/download/486865/support.svg',
      },
      {
        name: 'Careers',
        href: '/contact/careers',
        description: 'Join our team',
        icon: 'Briefcase',
        // icon: 'https://www.svgrepo.com/download/483991/career-2.svg',
      },
    ],
  },
];
