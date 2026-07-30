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
  
  console.log("Checking for uncategorized projects in Sanity...");
  const uncategorized = await client.fetch(`*[_type == "project" && (
    !defined(categories) || length(categories) == 0
  ) && (
    !defined(category) || category == ""
  )]{
    _id,
    title,
    category,
    categories
  }`);
  
  if (uncategorized.length === 0) {
    console.log("Success! No uncategorized projects found.");
  } else {
    console.log(`Found ${uncategorized.length} uncategorized projects:`);
    console.log(JSON.stringify(uncategorized, null, 2));
  }
}

run().catch(console.error);
