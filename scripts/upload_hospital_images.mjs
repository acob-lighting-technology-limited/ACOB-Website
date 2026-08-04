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
  if (process.argv.length < 4) {
    console.error("Usage: node upload_hospital_images.mjs <processed_dir> <sanity_doc_id> [template_name]");
    process.exit(1);
  }

  const processedDir = process.argv[2];
  const sanityDocId = process.argv[3];
  const templateName = process.argv[4] || 'healthcare1';

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

  if (!fs.existsSync(processedDir)) {
    console.error(`Error: Directory ${processedDir} not found.`);
    process.exit(1);
  }

  const files = fs.readdirSync(processedDir).filter(f => f.endsWith('.webp'));
  files.sort();

  console.log(`Found ${files.length} processed WebP images in ${processedDir}. Uploading...`);
  const uploadedAssets = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(processedDir, filename);
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
    console.error("Error: No images were uploaded successfully. Cannot update project document.");
    process.exit(1);
  }

  console.log(`Updating Sanity document "${sanityDocId}" with the uploaded images...`);
  const mainImageRef = uploadedAssets[0];

  await client
    .patch(sanityDocId)
    .set({
      projectImage: mainImageRef,
      projectContent: {
        description: templateName,
        images: uploadedAssets
      }
    })
    .commit();

  console.log(`Successfully updated ${sanityDocId} image fields!`);
}

run().catch(console.error);
