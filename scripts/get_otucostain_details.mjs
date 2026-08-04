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

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const query = `*[slug.current == "otu-costain-community-70-kwp-hybrid-solar-mini-grid-project-for-rural-electrification-ondo-state"] {
    _id,
    title,
    projectContent
  }`;
  
  const results = await client.fetch(query);
  console.log(JSON.stringify(results, null, 2));

  // Also query draft directly if it exists by ID
  if (results.length > 0) {
    const draftId = `drafts.${results[0]._id}`;
    const draft = await client.getDocument(draftId);
    console.log('Draft document:', JSON.stringify(draft, null, 2));
  }
}

run().catch(console.error);
