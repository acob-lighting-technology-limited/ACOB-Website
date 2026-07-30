import fs from 'fs';
import { createClient } from '@sanity/client';

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      value = value.trim();
      env[match[1]] = value.replace(/^['"]|['"]$/g, '');
    }
  });
  return env;
}

const updates = [
  {
    id: "12508d53-d47c-4bf9-a603-3865d9b7f76c",
    title: "Maiduguri 250 kWp Solar Hybrid Systems with 900 kWh Battery Storage Project for the International Organization for Migration, Borno State, Nigeria",
    slug: "maiduguri-250-kwp-solar-hybrid-systems-with-900-kwh-battery-storage-project-for-iom-borno-state",
    excerpt: "A 250 kWp solar hybrid system with 900 kWh battery storage was deployed in Maiduguri, Borno State, on behalf of the International Organization for Migration, ensuring reliable power for humanitarian operations."
  },
  {
    id: "159c5b02-949b-4de9-b7a5-9612857b5442",
    title: "Gwarinpa 8.5 kWp Premium Solar Home Installation Project, FCT, Nigeria",
    slug: "gwarinpa-8-5-kwp-premium-solar-home-installation-project-fct",
    excerpt: "An 8.5 kWp Premium Solar Home System was installed in Gwarimpa, FCT, delivering reliable and sustainable power for enhanced comfort and energy independence."
  },
  {
    id: "16561d1c-10b3-47d8-b9e3-3d7d9a4ca55a",
    title: "FCMB Bank 20.7 kWp Captive Power Solution Project, FCT, Nigeria",
    slug: "fcmb-bank-20-7-kwp-captive-power-solution-project-fct",
    excerpt: "A 20.7 kWp captive solar power system was deployed for FCMB Bank in FCT, ensuring reliable electricity supply, reducing operating costs, and promoting sustainable banking operations."
  },
  {
    id: "198fcb8d-9c3c-4890-bdbf-7afdf1e40254",
    title: "MST Sites 1,150 kWp Solar Hybrid Systems with 2.5 MWh Battery Project for 5 Minimum Subsidy Tender Sites and 1 Interconnected Mini Grid, Nasarawa State, Nigeria",
    slug: "mst-sites-1150-kwp-solar-hybrid-systems-with-2-5-mwh-battery-project-nasarawa-state",
    excerpt: "A 1,150 kWp solar hybrid system with 2.5 MWh battery storage was deployed across 5 Minimum Subsidy Tender sites and 1 Interconnected Mini Grid in Nasarawa State, boosting energy access."
  },
  {
    id: "21d6cb2a-404f-49cc-bf5a-f8bfd768447b",
    title: "AfDB Headquarters 100 kWp Solar Hybrid System with 614 kWh Battery Project, FCT, Nigeria",
    slug: "afdb-headquarters-100-kwp-solar-hybrid-system-with-614-kwh-battery-project-fct",
    excerpt: "A 100 kWp solar hybrid system with 614 kWh battery storage was installed at the African Development Bank headquarters in FCT, Nigeria, providing reliable and sustainable power."
  },
  {
    id: "563434ee-baa5-41bd-80c9-06e3049b3478",
    title: "Zamine Suite 50 kWp Captive Power Solution Project, Kano State, Nigeria",
    slug: "zamine-suite-50-kwp-captive-power-solution-project-kano-state",
    excerpt: "A 50 kWp captive solar power system was installed at Zamine Suite, Kano State, delivering reliable electricity, enhancing operational efficiency, and supporting sustainable business growth."
  },
  {
    id: "dd2dd500-0d59-4cf3-8a19-ce30eed300c3",
    title: "Starsight Utility Solar Hybrid Systems Project for Nigerian Banks, FCT, Nigeria",
    slug: "starsight-utility-solar-hybrid-systems-project-for-nigerian-banks-fct",
    excerpt: "Solar hybrid power systems were deployed at multiple bank branches across Nigeria on behalf of Starsight Utility Company in FCT, providing reliable electricity, lowering energy costs, and advancing sustainable banking operations.",
    location: "Starsight Utility"
  }
];

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN,
    useCdn: false,
  });

  console.log("Updating commercial installations in Sanity...");
  for (const item of updates) {
    console.log(`Updating document ${item.id}: "${item.title}"`);
    const fieldsToSet = {
      title: item.title,
      slug: {
        _type: 'slug',
        current: item.slug
      },
      excerpt: item.excerpt
    };
    if (item.location) {
      fieldsToSet.location = item.location;
    }
    
    await client
      .patch(item.id)
      .set(fieldsToSet)
      .commit();
  }
  console.log("Finished updating commercial projects.");
}

run().catch(console.error);
