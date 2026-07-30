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

  // Query all projects with categories and image ref
  const projects = await client.fetch(`*[_type == "project"]{
    _id,
    title,
    categories,
    "imageRef": projectImage.asset._ref
  }`);

  console.log(`Total projects in Sanity: ${projects.length}\n`);

  // Group by imageRef to see which ones share placeholders
  const imageGroups = {};
  projects.forEach(p => {
    if (!p.imageRef) {
      imageGroups['no-image'] = imageGroups['no-image'] || [];
      imageGroups['no-image'].push(p);
    } else {
      imageGroups[p.imageRef] = imageGroups[p.imageRef] || [];
      imageGroups[p.imageRef].push(p);
    }
  });

  console.log("--- Projects grouped by Image Asset Reference ---");
  let placeholderCount = 0;
  
  for (const [ref, list] of Object.entries(imageGroups)) {
    if (list.length > 1 && ref !== 'no-image') {
      console.log(`\nPlaceholder Reference: ${ref} (Shared by ${list.length} projects):`);
      list.forEach(p => {
        console.log(` - ${p.title} (${p.categories?.join(', ') || 'No category'})`);
      });
      placeholderCount += list.length;
    }
  }

  // Also print ones with no image at all
  if (imageGroups['no-image']) {
    console.log(`\nProjects with NO image asset reference (${imageGroups['no-image'].length} projects):`);
    imageGroups['no-image'].forEach(p => {
      console.log(` - ${p.title}`);
    });
  }
}

run().catch(console.error);
