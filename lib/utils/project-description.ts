/**
 * Project description generator.
 *
 * Descriptions are composed from reusable fragments rather than seven
 * monolithic template strings:
 *
 *   - The factual middle paragraphs (impact + environmental) are written ONCE
 *     as canonical blocks and reused by every template, so a number or a phrase
 *     about beneficiaries/jobs/CO₂ only ever needs to change in one place.
 *   - Variety between templates comes from swappable INTRO and CLOSING
 *     fragments.
 *
 * Emphasis is authored inline with `**bold**` markers inside each fragment, so
 * what gets bolded is explicit at authoring time. The output is structured
 * (paragraphs -> segments) and rendered as real React nodes by the consumer —
 * there is no HTML string and no `dangerouslySetInnerHTML`.
 */

export type DescriptionTemplate =
  | 'description1'
  | 'description2'
  | 'description3'
  | 'description4'
  | 'description5'
  | 'description6'
  | 'description7'
  | 'healthcare1'
  | 'healthcare2'
  | 'healthcare3';

export interface ProjectDescriptionData {
  kwp?: number;
  systemType?: string;
  location?: string;
  lga?: string;
  state?: string;
  beneficiaries?: number;
  jobsDirect?: number;
  jobsIndirect?: number;
  annualEnergyOutput?: number;
  annualCO2Reduction?: number;
  // Healthcare-specific metrics
  bess?: number;
  dieselReduc?: number;
  costSavings?: number;
  patientCareInc?: number;
  uptime?: number;
}

/** An inline run of text within a paragraph. */
export interface DescriptionSegment {
  text: string;
  bold: boolean;
}

/** A paragraph is an ordered list of inline segments. */
export type DescriptionParagraph = DescriptionSegment[];

/**
 * Get Nigerian geopolitical region from state.
 */
function getNigerianRegion(state?: string): string {
  if (!state) {
    return '[Region]';
  }

  const stateLower = state.toLowerCase().trim();

  const regions: Record<string, string[]> = {
    'North-Central': [
      'benue',
      'fct',
      'kogi',
      'kwara',
      'nasarawa',
      'niger',
      'plateau',
    ],
    'North-East': ['adamawa', 'bauchi', 'borno', 'gombe', 'taraba', 'yobe'],
    'North-West': [
      'kaduna',
      'kano',
      'katsina',
      'kebbi',
      'jigawa',
      'sokoto',
      'zamfara',
    ],
    'South-East': ['abia', 'anambra', 'ebonyi', 'enugu', 'imo'],
    'South-South': [
      'akwa ibom',
      'bayelsa',
      'cross river',
      'delta',
      'edo',
      'rivers',
    ],
    'South-West': ['ekiti', 'lagos', 'ogun', 'ondo', 'osun', 'oyo'],
  };

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(stateLower)) {
      return region;
    }
  }

  return '[Region]';
}

// ============================================================================
// FRAGMENTS
// ============================================================================
//
// Each fragment is one paragraph. `{placeholder}` tokens are substituted from
// the project data; `**...**` marks emphasis. Keep facts in the shared blocks
// below — only the framing should differ between intros/closings.

/** Canonical impact paragraph — beneficiaries and jobs. Written once. */
const IMPACT_BLOCK =
  'Through this project, over **{beneficiaries} beneficiaries** now have access ' +
  'to clean electricity. Its implementation created **{jobsDirect} direct jobs** ' +
  'and over **{jobsIndirect} indirect jobs**, advancing local employment and ' +
  'technical capacity development within the host community.';

/** Canonical environmental paragraph — energy output and CO₂. Written once. */
const ENVIRONMENTAL_BLOCK =
  'Generating an estimated **{annualEnergyOutput} kWh** annually, the system ' +
  'significantly reduces the dependence on diesel- and petrol-powered generators. ' +
  'This transition avoids approximately **{annualCO2Reduction} tonnes of CO₂** ' +
  "emissions every year, contributing to Nigeria's climate action and " +
  'sustainability goals.';

/** Healthcare impact paragraph — patients and critical care. Written once. */
const HEALTHCARE_IMPACT_BLOCK =
  'Through this intervention, the facility now serves over **{beneficiaries} annual patients** with stable, clean electricity. The project delivers a **{uptime}% system uptime** to power critical zones including **operating theatres, emergency wards, and laboratories**, enabling a **{patientCareInc}% increment in healthcare service capacity** and patient care.';

/** Healthcare environmental and financial paragraph — battery storage, diesel reduction, cost savings, and CO₂. Written once. */
const HEALTHCARE_ENVIRONMENTAL_BLOCK =
  'Generating an estimated **{annualEnergyOutput} kWh** annually, the **{kwp} kWp Solar PV** and **{bess} kWh Battery Storage (BESS)** system has achieved an **{dieselReduc}% reduction in diesel generator dependence**. This clean transition reduces operating overhead by **{costSavings}% in energy costs** and avoids **{annualCO2Reduction} Tons of CO₂** emissions annually.';

/** Opening framing — one per template. */
const INTROS: Record<DescriptionTemplate, string> = {
  description1:
    'The **{kwp} kWp {systemType}** project located in **{location}**, within ' +
    '**{lga} LGA** of **{state} State** in the **{region} region of Nigeria**, ' +
    'represents a strategic clean energy intervention deployed by ACOB Lighting ' +
    'Technology Limited to improve energy access for underserved populations. The ' +
    'system is engineered to deliver reliable, efficient, and affordable ' +
    'electricity that supports households, small enterprises, and essential ' +
    'community services.',
  description2:
    'In the community of **{location}** in **{lga} LGA**, **{state} State** in the ' +
    '**{region} region of Nigeria**, ACOB Lighting Technology Limited developed a ' +
    '**{kwp} kWp {systemType}** system to transform daily life and support the ' +
    'growth of local businesses. Before this intervention, many residents relied ' +
    'heavily on expensive and unreliable generator power, limiting both economic ' +
    'activities and quality of life.',
  description3:
    'The **{kwp} kWp {systemType}** installation delivered by ACOB Lighting ' +
    'Technology Limited in the **{location}** community, **{lga} LGA** of ' +
    '**{state} State** in the **{region} region of Nigeria**, is part of our ' +
    'expanding portfolio of distributed renewable energy assets designed to enable ' +
    'energy security, economic development, and long-term sustainability across ' +
    'Nigeria.',
  description4:
    'Situated in the **{location}** community within **{lga} LGA** of ' +
    '**{state} State** in the **{region} region of Nigeria**, this ' +
    '**{kwp} kWp {systemType}** project exemplifies ACOB Lighting Technology’s ' +
    'commitment to community empowerment through sustainable energy access. The ' +
    'installation was designed to address critical energy poverty while catalyzing ' +
    'socio-economic development in the region.',
  description5:
    'ACOB Lighting Technology deployed a state-of-the-art ' +
    '**{kwp} kWp {systemType}** in **{location}** community within **{lga} LGA**, ' +
    '**{state} State** in the **{region} region of Nigeria**, leveraging advanced ' +
    'photovoltaic technology and smart energy management systems to deliver optimal ' +
    'performance and reliability. This installation represents a benchmark in ' +
    'distributed renewable energy infrastructure across Nigeria.',
  description6:
    'The **{kwp} kWp {systemType}** project in the community of **{location}**, ' +
    '**{lga} LGA** of **{state} State** in the **{region} region of Nigeria**, was ' +
    'delivered through a collaborative approach that brought together ACOB Lighting ' +
    'Technology’s technical expertise, community leadership, and strategic ' +
    'stakeholders committed to advancing energy access and sustainable development.',
  description7:
    'As part of ACOB Lighting Technology’s climate action portfolio, the ' +
    '**{kwp} kWp {systemType}** installed in **{location}**, a community in ' +
    '**{lga} LGA**, **{state} State** in the **{region} region of Nigeria**, ' +
    'represents a significant contribution to Nigeria’s decarbonization ' +
    'efforts and environmental sustainability goals. This project was designed to ' +
    'deliver clean, reliable energy while minimizing ecological impact and ' +
    'advancing climate resilience.',
  healthcare1:
    'The solarization project at **{location}** within **{lga} LGA**, **{state} State** ' +
    'in the **{region} region of Nigeria**, represents a vital healthcare infrastructure ' +
    'upgrade deployed by ACOB Lighting Technology Limited in partnership with the ' +
    'Rural Electrification Agency (REA) and funded by the World Bank.',
  healthcare2:
    'ACOB Lighting Technology Limited successfully deployed a clean energy solution ' +
    'at **{location}** in **{lga} LGA**, **{state} State** within the **{region} region ' +
    'of Nigeria**, replacing unreliable power source with a sustainable solar micro-utility ' +
    'system designed specifically for the healthcare sector.',
  healthcare3:
    'Designed to address chronic energy challenges and high operational costs, this ' +
    'solar system at **{location}** in **{lga} LGA**, **{state} State** in the ' +
    '**{region} region of Nigeria**, represents a significant step forward in clean ' +
    'energy healthcare infrastructure.',
};

/** Closing framing — one per template. */
const CLOSINGS: Record<DescriptionTemplate, string> = {
  description1:
    "This installation underscores ACOB Lighting Technology Limited's ongoing " +
    'commitment to deploying resilient, community-centered, and environmentally ' +
    'responsible energy solutions across Nigeria.',
  description2:
    "The project stands as a testament to ACOB's mission to empower communities " +
    'through sustainable energy and create long-lasting social and economic impact.',
  description3:
    "As part of ACOB Lighting Technology's clean energy investments, this project " +
    'demonstrates our dedication to scaling impactful, reliable, and climate-aligned ' +
    'energy infrastructure across emerging markets.',
  description4:
    "This project reflects ACOB Lighting Technology's holistic approach to energy " +
    'development—one that prioritizes people, planet, and prosperity in equal ' +
    'measure.',
  description5:
    "This project showcases ACOB's technical capabilities and unwavering commitment " +
    'to deploying world-class renewable energy solutions that drive sustainable ' +
    'development and climate resilience.',
  description6:
    'ACOB Lighting Technology remains committed to partnership-driven energy ' +
    'solutions that deliver shared value, empower communities, and contribute to ' +
    "Nigeria's renewable energy transition.",
  description7:
    "This project underscores ACOB Lighting Technology's leadership in deploying " +
    'renewable energy infrastructure that protects the environment, supports ' +
    'livelihoods, and builds a sustainable future for all Nigerians.',
  healthcare1:
    'This installation underscores ACOB Lighting Technology’s dedication to ' +
    'providing resilient, clinical-grade solar energy solutions that support ' +
    'healthcare professionals and save patient lives.',
  healthcare2:
    'This project stands as a benchmark for hospital solarization across Nigeria, ' +
    'demonstrating how clean energy can modernize healthcare delivery and ensure ' +
    'critical care continuity.',
  healthcare3:
    'By investing in sustainable clinical power, ACOB continues to help build ' +
    'stronger, greener, and healthier Nigerian communities for generations to come.',
};

/**
 * Template composition: intro -> shared impact -> shared environmental -> closing.
 * The factual blocks are referenced, not duplicated.
 */
function composeTemplate(template: DescriptionTemplate): string[] {
  if (template.startsWith('healthcare')) {
    return [
      INTROS[template],
      HEALTHCARE_IMPACT_BLOCK,
      HEALTHCARE_ENVIRONMENTAL_BLOCK,
      CLOSINGS[template],
    ];
  }

  return [
    INTROS[template],
    IMPACT_BLOCK,
    ENVIRONMENTAL_BLOCK,
    CLOSINGS[template],
  ];
}

// ============================================================================
// RENDERING
// ============================================================================

/** Split a substituted paragraph into bold / non-bold segments. */
function parseEmphasis(text: string): DescriptionParagraph {
  const segments: DescriptionParagraph = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  return segments;
}

/**
 * Generate a project description as structured paragraphs.
 *
 * @param template - Which template to use (`description1`..`description7`).
 * @param data - Project facts used to fill placeholders.
 * @returns An array of paragraphs, each a list of `{ text, bold }` segments.
 */
export function generateProjectDescription(
  template: DescriptionTemplate,
  data: ProjectDescriptionData,
): DescriptionParagraph[] {
  const values: Record<string, string> = {
    kwp: data.kwp?.toString() || '[kwp]',
    systemType: data.systemType || '[System Type]',
    location: data.location || '[Location]',
    lga: data.lga || '[LGA]',
    state: data.state || '[State]',
    region: getNigerianRegion(data.state),
    beneficiaries: data.beneficiaries?.toLocaleString() || '[beneficiaries]',
    jobsDirect: data.jobsDirect?.toString() || '[direct jobs]',
    jobsIndirect: data.jobsIndirect?.toString() || '[indirect jobs]',
    annualEnergyOutput:
      data.annualEnergyOutput?.toLocaleString() || '[annual energy output]',
    annualCO2Reduction:
      data.annualCO2Reduction?.toLocaleString() || '[CO₂ reduction]',
    bess: data.bess?.toString() || '[bess]',
    dieselReduc: data.dieselReduc?.toString() || '[diesel reduction]',
    costSavings: data.costSavings?.toString() || '[cost savings]',
    patientCareInc:
      data.patientCareInc?.toString() || '[patient care increment]',
    uptime: data.uptime?.toString() || '[uptime]',
  };

  return composeTemplate(template).map(fragment => {
    const substituted = fragment.replace(
      /\{(\w+)\}/g,
      (_, key: string) => values[key] ?? `[${key}]`,
    );
    return parseEmphasis(substituted);
  });
}

/**
 * Flatten generated paragraphs into a plain-text string (no emphasis).
 * Useful for previews, SEO, or anywhere markup is not wanted.
 */
export function descriptionToPlainText(
  paragraphs: DescriptionParagraph[],
): string {
  return paragraphs
    .map(paragraph => paragraph.map(segment => segment.text).join(''))
    .join('\n\n');
}
