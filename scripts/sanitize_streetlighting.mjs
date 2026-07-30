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

  const docId = "7d06e006-0c98-4fb4-b701-017412798726";
  const newTitle = "Airport Road Streetlighting Infrastructure Project, FCT, Nigeria";
  const newSlug = "airport-road-streetlighting-infrastructure-project-fct";
  const newExcerpt = "ACOB designed, developed, and commissioned streetlighting infrastructure along Airport Road, FCT, Abuja, providing reliable public lighting to enhance safety and visibility.";

  console.log(`Updating streetlighting project ${docId}...`);
  await client
    .patch(docId)
    .set({
      title: newTitle,
      slug: {
        _type: 'slug',
        current: newSlug
      },
      excerpt: newExcerpt
    })
    .commit();

  console.log("Streetlighting project updated successfully.");
}

run().catch(console.error);
