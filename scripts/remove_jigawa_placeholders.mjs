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
  const token = env.SANITY_API_TOKEN;
  
  if (!token) {
    console.error("Error: SANITY_API_TOKEN not found in .env.local");
    process.exit(1);
  }
  
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: token,
    useCdn: false,
  });

  const projects = await client.fetch(`*[_type == "project" && (
    title match "Babura" || 
    title match "Hadejia" || 
    title match "Kazaure" || 
    title match "Rasheed"
  )] { _id, title }`);

  console.log(`Found ${projects.length} Jigawa projects to remove placeholders from:`);
  
  for (const doc of projects) {
    console.log(`- Removing placeholder image from "${doc.title}" (${doc._id})...`);
    try {
      await client
        .patch(doc._id)
        .unset(['projectImage', 'projectContent.images'])
        .commit();
      console.log(`  Successfully updated ${doc._id}!`);
    } catch (e) {
      console.error(`  Failed to update ${doc._id}: ${e.message}`);
    }
  }
}

run().catch(console.error);
