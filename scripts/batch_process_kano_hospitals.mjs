import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

  const kanoBaseDir = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kano State";
  const dirs = fs.readdirSync(kanoBaseDir);

  const mappings = [
    {
      keyword: "Aminu Kano",
      id: "healthcare-project-aminu-kano-teaching-hospital",
      prefix: "aminu_kano",
      template: "healthcare3"
    },
    {
      keyword: "Infectious",
      id: "healthcare-project-infectious-disease-hospital-fagge",
      prefix: "idh_fagge",
      template: "healthcare2"
    },
    {
      keyword: "Wase",
      id: "healthcare-project-abdullahi-wase-hospital",
      prefix: "wase",
      template: "healthcare1"
    },
    {
      keyword: "Dawakin Tofa",
      id: "healthcare-project-dawakin-tofa-general-hospital",
      prefix: "dawakin_tofa",
      template: "healthcare2"
    },
    {
      keyword: "Sanusi",
      id: "healthcare-project-sir-mohammed-sanusi-hospital",
      prefix: "sanusi",
      template: "healthcare3"
    }
  ];

  for (const m of mappings) {
    const folderName = dirs.find(d => d.includes(m.keyword));
    if (!folderName) {
      console.warn(`Could not find folder for keyword: ${m.keyword}`);
      continue;
    }

    const srcPath = path.join(kanoBaseDir, folderName);
    const destPath = `C:\\Users\\IT_COMMS\\Pictures\\New folder\\${m.prefix}_Processed`;
    
    console.log(`\n========================================`);
    console.log(`Processing: ${folderName} -> ${m.id}`);
    console.log(`========================================`);

    // 1. Process images via python script
    try {
      const cmd = `python scripts/process_hospital_images.py "${srcPath}" "${destPath}" "${m.prefix}"`;
      console.log(`Running image processor: ${cmd}`);
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Image processing failed for ${m.keyword}:`, err.message);
      continue;
    }

    // 2. Read processed WebP images
    if (!fs.existsSync(destPath)) {
      console.error(`Processed directory ${destPath} does not exist. Skipping.`);
      continue;
    }
    const webpFiles = fs.readdirSync(destPath).filter(f => f.endsWith('.webp'));
    if (webpFiles.length === 0) {
      console.warn(`No processed WebP images found for ${m.keyword}. Skipping.`);
      continue;
    }

    // 3. Upload to Sanity
    console.log(`Uploading ${webpFiles.length} WebP images to Sanity...`);
    const uploadedAssets = [];
    for (const file of webpFiles) {
      const filePath = path.join(destPath, file);
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const asset = await client.assets.upload('image', fileBuffer, {
          filename: file,
        });
        uploadedAssets.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          }
        });
        console.log(`Uploaded asset: ${asset._id} for ${file}`);
      } catch (uploadErr) {
        console.error(`Upload failed for file ${file}:`, uploadErr.message);
      }
    }

    // 4. Update Sanity project document
    if (uploadedAssets.length > 0) {
      console.log(`Patching Sanity document ${m.id}...`);
      await client
        .patch(m.id)
        .set({
          projectImage: uploadedAssets[0],
          projectContent: {
            description: m.template,
            images: uploadedAssets
          }
        })
        .commit();
      console.log(`Successfully patched ${m.id}!`);
    } else {
      console.error(`Failed to upload any images for ${m.keyword}`);
    }
  }

  console.log("\nBatch processing completed successfully!");
}

run().catch(console.error);
