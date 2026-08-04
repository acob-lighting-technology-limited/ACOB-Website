import fs from 'fs';
import path from 'path';
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
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      env[match[1]] = value.trim();
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

  const ikaraDir = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Ikara_Processed";
  const files = fs.readdirSync(ikaraDir).filter(f => f.endsWith('.webp'));
  files.sort();

  console.log(`Found ${files.length} processed images for Ikara. Uploading...`);
  const uploadedAssets = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(ikaraDir, filename);
    console.log(`Uploading [${i+1}/${files.length}]: ${filename}`);
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const asset = await client.assets.upload('image', fileBuffer, {
        filename: filename,
      });
      uploadedAssets.push({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      });
      console.log(`Successfully uploaded: ${asset._id}`);
    } catch (e) {
      console.error(`Failed to upload ${filename}: ${e.message}`);
    }
  }

  if (uploadedAssets.length === 0) {
    console.error("Error: No images were uploaded successfully. Cannot update Ikara project.");
    process.exit(1);
  }

  const projectId = "healthcare-project-ikara-general-hospital";
  console.log(`Updating Sanity document "${projectId}" with the uploaded images...`);

  const mainImageRef = uploadedAssets[0];

  await client
    .patch(projectId)
    .set({
      projectImage: mainImageRef,
      projectContent: {
        description: 'healthcare1', // retain template
        images: uploadedAssets
      }
    })
    .commit();

  console.log(`Successfully updated ${projectId} image fields!`);
}

run().catch(console.error);
