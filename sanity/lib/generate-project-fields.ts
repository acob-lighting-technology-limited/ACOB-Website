/**
 * Utility functions to auto-generate project title and excerpt
 */

interface ProjectData {
  location?: string;
  state?: string;
  category?: string;
  subcategory?: string;
  impactMetrics?: {
    kwp?: number;
    systemType?: string;
    beneficiaries?: number;
    annualEnergyOutput?: number;
  };
}

/**
 * Generate project title from project data
 */
export function generateProjectTitle(data: ProjectData): string {
  const { location, impactMetrics, state, category, subcategory } = data;
  const kwp = impactMetrics?.kwp;
  const systemType = impactMetrics?.systemType;

  if (!location || !kwp || !systemType || !state || !category) {
    return '';
  }

  const categoryLabels: Record<string, string> = {
    'rural-electrification': 'Rural Electrification',
    'commercial-installations': 'Commercial Installation',
    'street-lighting': 'Street Lighting',
    'healthcare-projects': 'Healthcare Projects',
  };

  const subcategoryLabels: Record<string, string> = {
    primary: 'Primary Healthcare',
    secondary: 'Secondary Healthcare',
    tertiary: 'Tertiary Healthcare',
    isolated: 'Isolated Mini-Grids',
    interconnected: 'Interconnected Mini-Grids',
  };

  const detailLabel =
    subcategory && subcategoryLabels[subcategory]
      ? subcategoryLabels[subcategory]
      : categoryLabels[category] || category;

  const stateLabel = state.toUpperCase() === 'FCT' ? 'FCT' : `${state} State`;

  const isHealthcare = category === 'healthcare-projects';
  const nameLabel = isHealthcare
    ? location.toLowerCase().includes('hospital')
      ? location
      : `${location} General Hospital`
    : `${location} Community`;

  return `${nameLabel} ${kwp} kWp ${systemType} Project for ${detailLabel}, ${stateLabel}, Nigeria`;
}

/**
 * Generate project excerpt from project data
 */
export function generateProjectExcerpt(data: ProjectData): string {
  const { location, impactMetrics, state, category } = data;
  const kwp = impactMetrics?.kwp;
  const systemType = impactMetrics?.systemType;
  const beneficiaries = impactMetrics?.beneficiaries;
  const annualEnergyOutput = impactMetrics?.annualEnergyOutput;

  if (!location || !kwp || !systemType || !state) {
    return '';
  }

  const stateLabel = state.toUpperCase() === 'FCT' ? 'FCT' : `${state} State`;
  const isHealthcare = category === 'healthcare-projects';
  const nameLabel = isHealthcare
    ? location.toLowerCase().includes('hospital')
      ? location
      : `${location} General Hospital`
    : `${location} Community`;

  let excerpt = `A ${kwp} kWp ${systemType} project at ${nameLabel}, ${stateLabel}`;

  if (beneficiaries) {
    const unit = isHealthcare ? 'patients' : 'beneficiaries';
    excerpt += `, providing clean energy to ${beneficiaries.toLocaleString()}+ ${unit}`;
  }

  if (annualEnergyOutput) {
    excerpt += ` and generating ${annualEnergyOutput.toLocaleString()} kWh annually`;
  }

  excerpt += '.';

  // Truncate if too long (max 200 chars for SEO)
  if (excerpt.length > 200) {
    excerpt = `${excerpt.substring(0, 197)}...`;
  }

  return excerpt;
}

/**
 * Check if required fields are filled for title generation
 */
export function canGenerateTitle(data: ProjectData): boolean {
  const { location, impactMetrics, state, category } = data;
  return !!(
    location &&
    impactMetrics?.kwp &&
    impactMetrics?.systemType &&
    state &&
    category
  );
}

/**
 * Check if required fields are filled for excerpt generation
 */
export function canGenerateExcerpt(data: ProjectData): boolean {
  const { location, impactMetrics, state } = data;
  return !!(
    location &&
    impactMetrics?.kwp &&
    impactMetrics?.systemType &&
    state
  );
}
