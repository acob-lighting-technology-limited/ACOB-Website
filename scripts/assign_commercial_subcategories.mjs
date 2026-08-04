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

const subcategories = {
  "12508d53-d47c-4bf9-a603-3865d9b7f76c": "commercial",   // IOM
  "159c5b02-949b-4de9-b7a5-9612857b5442": "residential",  // Premium Solar Home
  "16561d1c-10b3-47d8-b9e3-3d7d9a4ca55a": "commercial",   // FCMB Bank
  "198fcb8d-9c3c-4890-bdbf-7afdf1e40254": "commercial",   // MST Sites
  "21d6cb2a-404f-49cc-bf5a-f8bfd768447b": "commercial",   // AfDB Headquarters
  "563434ee-baa5-41bd-80c9-06e3049b3478": "commercial",   // Zamine Suite
  "dd2dd500-0d59-4cf3-8a19-ce30eed300c3": "commercial"    // Starsight Utility Banks
};

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN,
    useCdn: false,
  });

  console.log("Assigning subcategories (commercial/residential) to commercial installations in Sanity...");
  for (const [id, subcat] of Object.entries(subcategories)) {
    console.log(`Setting subcategory to "${subcat}" for document ID ${id}...`);
    await client
      .patch(id)
      .set({ subcategory: subcat })
      .commit();
  }
  console.log("Finished updating subcategories.");
}

run().catch(console.error);
