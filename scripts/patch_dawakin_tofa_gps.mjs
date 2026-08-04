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

function requireToken(env) {
  const token = process.env.SANITY_API_TOKEN || env.SANITY_API_TOKEN;
  if (!token) {
    console.error('Missing SANITY_API_TOKEN. Set it in your environment or .env.local before running this script.');
    process.exit(1);
  }
  return token;
}

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: requireToken(env),
    useCdn: false,
  });

  // Search for Dawakin Tofa project
  const projects = await client.fetch(`*[_type == "project" && title match "Dawakin Tofa"] {
    _id,
    title
  }`);

  if (projects.length === 0) {
    console.log('No project found matching "Dawakin Tofa".');
    return;
  }

  const project = projects[0];
  console.log(`Found project: "${project.title}" (ID: ${project._id})`);

  const lat = 12.1082;
  const lon = 8.3310;

  console.log(`Patching coordinates: Latitude=${lat}, Longitude=${lon}...`);

  await client.patch(project._id).set({
    latitude: lat,
    longitude: lon
  }).commit();

  console.log(`✅ Successfully updated published project record.`);

  const draftId = `drafts.${project._id}`;
  const draftExists = await client.getDocument(draftId);
  if (draftExists) {
    await client.patch(draftId).set({
      latitude: lat,
      longitude: lon
    }).commit();
    console.log(`✅ Successfully updated draft project record.`);
  }
}

run().catch(console.error);
