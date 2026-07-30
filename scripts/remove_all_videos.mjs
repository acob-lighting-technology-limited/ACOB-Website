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

  const projectIds = [
    "healthcare-project-infectious-disease-hospital-fagge",
    "healthcare-project-abdullahi-wase-hospital"
  ];

  for (const docId of projectIds) {
    console.log(`\nChecking project document "${docId}"...`);
    try {
      const doc = await client.getDocument(docId);
      if (!doc || !doc.projectContent || !doc.projectContent.images) {
        console.log(`Document not found or has no images.`);
        continue;
      }

      const filteredImages = doc.projectContent.images.filter(img => img._type !== 'video');
      
      if (filteredImages.length === doc.projectContent.images.length) {
        console.log(`No video assets found in "${docId}".`);
      } else {
        console.log(`Removing videos from "${docId}" (Images: ${doc.projectContent.images.length} -> ${filteredImages.length})...`);
        await client
          .patch(docId)
          .set({
            "projectContent.images": filteredImages
          })
          .commit();
        console.log(`Successfully updated "${docId}"!`);
      }
    } catch (e) {
      console.error(`Failed to clean document ${docId}:`, e.message);
    }
  }
}

run().catch(console.error);
