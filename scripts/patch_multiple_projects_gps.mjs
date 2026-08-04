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

const gpsData = {
  fagge: {
    search: "Infectious Disease Hospital",
    lat: 12.0142,
    lon: 8.5276
  },
  gwantu: {
    search: "Gwantu General Hospital",
    lat: 9.2223,
    lon: 8.4626
  },
  ikara: {
    search: "Ikara General Hospital",
    lat: 11.1549,
    lon: 8.2319
  }
};

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: requireToken(env),
    useCdn: false,
  });

  for (const [key, data] of Object.entries(gpsData)) {
    console.log(`\nProcessing ${key.toUpperCase()}: searching for "${data.search}"...`);
    const projects = await client.fetch(`*[_type == "project" && title match $search] {
      _id,
      title
    }`, { search: data.search });

    if (projects.length === 0) {
      console.log(`❌ No project found matching "${data.search}".`);
      continue;
    }

    const project = projects[0];
    console.log(`Found project: "${project.title}" (ID: ${project._id})`);
    console.log(`Patching coordinates: Latitude=${data.lat}, Longitude=${data.lon}...`);

    try {
      // Patch published
      await client.patch(project._id).set({
        latitude: data.lat,
        longitude: data.lon
      }).commit();
      console.log(`✅ Successfully updated published project record.`);

      // Patch draft if it exists
      const draftId = `drafts.${project._id}`;
      const draftExists = await client.getDocument(draftId);
      if (draftExists) {
        await client.patch(draftId).set({
          latitude: data.lat,
          longitude: data.lon
        }).commit();
        console.log(`   └─ Successfully updated draft project record.`);
      }
    } catch (err) {
      console.error(`❌ Failed to update project: ${err.message}`);
    }
  }
}

run().catch(console.error);
