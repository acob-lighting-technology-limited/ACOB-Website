export const ANNIVERSARY_2026 = {
  title: 'Celebrating 10 Years of Impact',
  period: '2016-2026',
  tagline: 'Lighting Up Nigeria',
  summary:
    'For Ten remarkable years, ACOB Lighting Technology Limited has remained committed to lighting up communities, driving innovation, and creating lasting impact across Nigeria.',
  extendedSummary:
    'A decade of purpose, progress, and power. From 2016 to 2026, ACOB Lighting Technology Limited has grown through excellence, innovation, and transformation while helping shape a brighter future for communities across Nigeria.',
  image: '/images/acob-10-years-impact-2026.jpeg',
  hashtags: [
    '#ACOBLighting',
    '#10YearsOfImpact',
    '#LightingUpNigeria',
    '#AnniversaryCelebration',
    '#SolarInnovation',
    '#PoweringCommunities',
    '#DecadeOfImpact',
  ],
} as const;

export function isAnniversaryYear2026(date = new Date()): boolean {
  return date.getFullYear() === 2026;
}
