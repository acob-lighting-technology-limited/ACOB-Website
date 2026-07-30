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

  const ikaraDir = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Ikara_User_Processed";
  const webpFiles = fs.readdirSync(ikaraDir).filter(f => f.endsWith('.webp'));
  webpFiles.sort();

  console.log(`Found ${webpFiles.length} processed images for Ikara. Uploading images to Sanity...`);
  const projectImages = [];

  for (let i = 0; i < webpFiles.length; i++) {
    const filename = webpFiles[i];
    const filePath = path.join(ikaraDir, filename);
    console.log(`Uploading image [${i+1}/${webpFiles.length}]: ${filename}`);
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const asset = await client.assets.upload('image', fileBuffer, {
        filename: filename,
      });
      projectImages.push({
        _type: 'image',
        alt: `Solar power and battery storage installations at Ikara Zonal Hospital, Kaduna State (View ${i+1})`,
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      });
      console.log(`Successfully uploaded image asset: ${asset._id}`);
    } catch (e) {
      console.error(`Failed to upload ${filename}: ${e.message}`);
    }
  }

  // 2. Upload video file
  const videoSourcePath = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State\\⁠Ikara General Hospital, Ikara\\20260604_085310000_iOS.MOV";
  let videoAssetRef = null;

  if (fs.existsSync(videoSourcePath)) {
    console.log(`\nUploading video: ${path.basename(videoSourcePath)}...`);
    try {
      const videoBuffer = fs.readFileSync(videoSourcePath);
      const asset = await client.assets.upload('file', videoBuffer, {
        filename: path.basename(videoSourcePath),
        contentType: 'video/quicktime'
      });
      videoAssetRef = {
        _type: 'video',
        title: 'Ikara Zonal Hospital Solar System Installation Walkthrough',
        alt: 'Video walkthrough showing clean solar power generation and BESS utility integration at Ikara General Hospital.',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      };
      console.log(`Successfully uploaded video asset: ${asset._id}`);
    } catch (e) {
      console.error(`Failed to upload video asset: ${e.message}`);
    }
  } else {
    console.warn(`Warning: Video file ${videoSourcePath} was not found.`);
  }

  // 3. Assemble images and videos array
  const allMedia = [...projectImages];
  if (videoAssetRef) {
    allMedia.push(videoAssetRef);
  }

  if (allMedia.length === 0) {
    console.error("Error: No media assets were uploaded. Cannot patch project document.");
    process.exit(1);
  }

  const projectId = "healthcare-project-ikara-general-hospital";
  console.log(`\nUpdating Sanity document "${projectId}" with new files...`);

  // Main hero preview should be the first watermarked image
  const mainImageRef = projectImages[0];

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
        images: allMedia
      }
    })
    .commit();

  console.log(`Successfully updated ${projectId} with ${projectImages.length} images and ${videoAssetRef ? '1 video' : '0 videos'}!`);
}

run().catch(console.error);
