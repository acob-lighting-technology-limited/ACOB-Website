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
  const env = loadEnv('C:\\Users\\IT_COMMS\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const projects = await client.fetch(`*[_type == "project"] {
    _id,
    title,
    latitude,
    longitude
  }`);

  const missingGps = projects.filter(p => p.latitude === undefined || p.latitude === null || p.longitude === undefined || p.longitude === null);

  console.log(`Total projects in database: ${projects.length}`);
  console.log(`Projects missing Latitude/Longitude coordinates: ${missingGps.length}\n`);

  if (missingGps.length > 0) {
    missingGps.forEach((p, index) => {
      console.log(`${index + 1}. "${p.title}" (ID: ${p._id})`);
      console.log(`   └─ Lat: ${p.latitude ?? 'Missing'}, Lon: ${p.longitude ?? 'Missing'}`);
    });
  }
}

run().catch(console.error);
