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

  const projects = await client.fetch(`*[_type == "project" && defined(category)] {
    _id,
    title
  }`);

  console.log(`Found ${projects.length} projects with legacy "category" field. Removing them...\n`);

  for (const project of projects) {
    try {
      // Unset both published and draft records
      await client.patch(project._id).unset(['category']).commit();
      console.log(`✅ Removed legacy "category" from: "${project.title}"`);
      
      const draftId = `drafts.${project._id}`;
      const draftExists = await client.getDocument(draftId);
      if (draftExists) {
        await client.patch(draftId).unset(['category']).commit();
        console.log(`   └─ Removed from draft as well`);
      }
    } catch (err) {
      console.error(`❌ Failed to update project "${project.title}":`, err.message);
    }
  }

  console.log('\nLegacy "category" fields successfully cleaned from database!');
}

run().catch(console.error);
