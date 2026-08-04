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
  
  console.log("Fetching projects in healthcare-projects and listing their image assets...");
  const healthcare = await client.fetch(`*[_type == "project" && ("healthcare-projects" in categories || category == "healthcare-projects") && defined(projectImage)]{
    title,
    "projectImage": projectImage.asset->url
  }`);
  console.log("Healthcare projects with projectImage:", JSON.stringify(healthcare, null, 2));

  console.log("\nFetching projects in pue and listing their image assets...");
  const pue = await client.fetch(`*[_type == "project" && ("pue" in categories || category == "pue")]{
    title,
    "projectImage": projectImage.asset->url,
    "projectContentImages": projectContent.images[]{ "url": asset->url }
  }`);
  console.log("PUE projects with images:", JSON.stringify(pue, null, 2));
}

run().catch(console.error);
