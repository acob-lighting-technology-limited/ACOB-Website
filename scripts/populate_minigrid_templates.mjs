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

  console.log("Fetching all projects to update mini-grid description templates...");
  const projects = await client.fetch(`*[_type == "project"]{ _id, title, categories, projectContent }`);

  const miniGrids = projects.filter(p => {
    const categories = p.categories || [];
    return categories.includes('mini-grids') || categories.includes('rural-electrification');
  });

  console.log(`Found ${miniGrids.length} mini-grid projects.`);

  // We rotate through templates description1 to description5
  const templates = ['description1', 'description2', 'description3', 'description4', 'description5'];

  let updatedCount = 0;
  for (let i = 0; i < miniGrids.length; i++) {
    const p = miniGrids[i];
    const currentTemplate = p.projectContent?.description;

    // Only update if it is not set (undefined or null)
    if (!currentTemplate) {
      const templateToAssign = templates[i % templates.length];
      console.log(`Updating "${p.title}" -> assigning ${templateToAssign}`);

      const projectContent = p.projectContent || {};
      
      await client
        .patch(p._id)
        .set({
          projectContent: {
            ...projectContent,
            description: templateToAssign
          }
        })
        .commit();
        
      updatedCount++;
    } else {
      console.log(`Skipping "${p.title}" (already has template: ${currentTemplate})`);
    }
  }

  console.log(`Finished updating ${updatedCount} mini-grid projects in Sanity database.`);
}

run().catch(console.error);
