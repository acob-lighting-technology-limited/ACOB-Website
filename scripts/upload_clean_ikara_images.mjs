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

  const cleanDir = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Ikara_Clean_Processed";
  const webpFiles = fs.readdirSync(cleanDir).filter(f => f.endsWith('.webp'));
  webpFiles.sort();

  console.log(`Uploading ${webpFiles.length} clean WebP images to Sanity...`);
  const uploadedAssets = [];

  for (let i = 0; i < webpFiles.length; i++) {
    const filename = webpFiles[i];
    const filePath = path.join(cleanDir, filename);
    console.log(`Uploading image [${i+1}/${webpFiles.length}]: ${filename}`);
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const asset = await client.assets.upload('image', fileBuffer, {
        filename: filename, // will match original iOS filename (e.g. 20260604_083048000_iOS.webp)
      });
      uploadedAssets.push({
        _type: 'image',
        alt: `Clean energy solar power installation photo at Ikara General Hospital, Kaduna State (${filename})`,
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
    console.error("Error: No assets were uploaded. Cannot patch project document.");
    process.exit(1);
  }

  const projectId = "healthcare-project-ikara-general-hospital";
  console.log(`\nPatching Sanity document "${projectId}" with original-named images (and removing the video)...`);

  const mainImageRef = uploadedAssets[0];

  await client
    .patch(projectId)
    .set({
      projectImage: {
        _type: 'image',
        alt: 'Ikara Zonal Hospital 50 kWp Solar PV + Battery Storage Facility, Kaduna State, Nigeria',
        asset: mainImageRef.asset
      },
      projectContent: {
        description: 'healthcare1', // retain template
        images: uploadedAssets // ONLY the 6 watermarked images, no video!
      }
    })
    .commit();

  console.log(`Successfully updated ${projectId}! Video removed and images registered with their clean original filenames.`);
}

run().catch(console.error);
