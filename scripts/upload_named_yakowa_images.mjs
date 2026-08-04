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

  const namedDir = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Yakowa_Project_Named";
  const webpFiles = fs.readdirSync(namedDir).filter(f => f.endsWith('.webp'));
  webpFiles.sort();

  console.log(`Uploading ${webpFiles.length} project-named WebP images to Sanity...`);
  const uploadedAssets = [];

  for (let i = 0; i < webpFiles.length; i++) {
    const filename = webpFiles[i];
    const filePath = path.join(namedDir, filename);
    console.log(`Uploading image [${i+1}/${webpFiles.length}]: ${filename}`);
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const asset = await client.assets.upload('image', fileBuffer, {
        filename: filename,
      });
      uploadedAssets.push({
        _type: 'image',
        filename: filename, // helper
        alt: `Solar power and battery storage installations at Sir Patrick Yakowa Zonal Hospital, Kaduna State (${filename.replace('.webp', '')})`,
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

  // Find the asset that represents the main image (sir-patrick-yakowa-zonal-hospital-1.webp)
  const mainImageAsset = uploadedAssets.find(a => a.filename === "sir-patrick-yakowa-zonal-hospital-1.webp");
  
  if (!mainImageAsset) {
    console.error("Error: Could not find main image sir-patrick-yakowa-zonal-hospital-1.webp in uploaded assets.");
    process.exit(1);
  }

  const projectId = "healthcare-project-sir-patrick-yakowa-zonal-hospital";
  console.log(`\nPatching Sanity document "${projectId}"...`);
  console.log(`Using ${mainImageAsset.filename} (${mainImageAsset.asset._ref}) as the main projectImage.`);

  // Clean the internal array helper property 'filename' before writing to Sanity
  const sanityImagesArray = uploadedAssets.map(a => ({
    _type: 'image',
    alt: a.alt,
    asset: a.asset
  }));

  await client
    .patch(projectId)
    .set({
      projectImage: {
        _type: 'image',
        alt: 'Sir Patrick Yakowa Zonal Hospital 50 kWp Solar PV + Battery Storage Facility, Kafanchan, Kaduna State, Nigeria',
        asset: mainImageAsset.asset
      },
      projectContent: {
        description: 'healthcare2', // template 2
        images: sanityImagesArray
      }
    })
    .commit();

  console.log(`Successfully updated ${projectId}! Images are renamed to match the project, and the main image is set to the user-specified photo.`);
}

run().catch(console.error);
