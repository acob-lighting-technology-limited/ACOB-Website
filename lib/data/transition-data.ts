import { COMPANY_STATS } from '@/lib/constants/app.constants';

const currentYear = new Date().getFullYear();
const yearsExperience = Math.max(0, currentYear - 2016);

export const stats = [
  {
    number: COMPANY_STATS.projectsCompleted,
    suffix: '+',
    label: 'Installed Projects',
  },
  {
    number: COMPANY_STATS.totalCapacityMW,
    suffix: 'MW+',
    label: 'Total Capacity Installed',
  },
  {
    number: COMPANY_STATS.communitiesServed,
    suffix: '+',
    label: 'Communities Served',
  },
  { number: yearsExperience, suffix: '+', label: 'Years Experience' },
];
