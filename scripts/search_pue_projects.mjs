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
  
  console.log("Searching for PUE keywords in Sanity project titles...");
  const projects = await client.fetch(`*[_type == "project" && (
    title match "EV" || title match "Irrigation" || title match "Milling" || title match "CNG" || title match "Productive"
  )]{
    title,
    category,
    categories,
    "projectImage": projectImage.asset->url
  }`);
  console.log("Matching projects:", JSON.stringify(projects, null, 2));
}

run().catch(console.error);
