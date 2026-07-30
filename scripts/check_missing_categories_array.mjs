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
  
  console.log("Checking for projects with legacy 'category' but missing 'categories' array...");
  const missingArray = await client.fetch(`*[_type == "project" && (
    !defined(categories) || length(categories) == 0
  ) && defined(category) && category != ""]{
    _id,
    title,
    category
  }`);
  
  if (missingArray.length === 0) {
    console.log("Success! All projects with a category have the 'categories' array populated.");
  } else {
    console.log(`Found ${missingArray.length} projects missing the 'categories' array:`);
    console.log(JSON.stringify(missingArray, null, 2));
  }
}

run().catch(console.error);
