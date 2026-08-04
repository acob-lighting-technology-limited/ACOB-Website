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

  const projects = await client.fetch(`*[_type == "project" && (defined(category) || defined(categories))] {
    _id,
    title,
    category,
    categories
  }`);

  console.log(`Found ${projects.length} projects. Auditing category/categories synchronization...\n`);

  for (const project of projects) {
    const singular = project.category;
    const plural = project.categories || [];

    let needsUpdate = false;
    let newPlural = [...plural];

    if (singular && !plural.includes(singular)) {
      newPlural.push(singular);
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`🔄 Project: "${project.title}"`);
      console.log(`   Singular category: "${singular}"`);
      console.log(`   Plural categories before: [${plural.join(', ')}]`);
      console.log(`   Plural categories after:  [${newPlural.join(', ')}]`);
      
      try {
        await client.patch(project._id).set({ categories: newPlural }).commit();
        console.log(`   ✅ Plural categories updated!\n`);
      } catch (err) {
        console.error(`   ❌ Failed to patch:`, err.message);
      }
    }
  }

  console.log('Category migration audit finished.');
}

run().catch(console.error);
