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

  const projects = await client.fetch(`*[_type == "project"] {
    _id,
    title,
    projectContent
  }`);

  console.log(`Scanning ${projects.length} projects for malformed gallery asset references...\n`);

  let fixCount = 0;

  for (const project of projects) {
    let needsPatch = false;
    const patchData = {};

    if (project.projectContent && Array.isArray(project.projectContent.images)) {
      let galleryChanged = false;
      const updatedImages = project.projectContent.images.map((img, index) => {
        // Check if asset is defined and is an object containing _id directly instead of being a reference
        if (img.asset && img.asset._id && !img.asset._ref) {
          galleryChanged = true;
          console.log(`🛠️ Found malformed asset reference in "${project.title}" gallery index ${index}`);
          console.log(`   Direct ID: "${img.asset._id}" -> Converting to reference`);
          return {
            ...img,
            asset: {
              _type: 'reference',
              _ref: img.asset._id
            }
          };
        }
        return img;
      });

      if (galleryChanged) {
        patchData.projectContent = {
          ...project.projectContent,
          images: updatedImages
        };
        needsPatch = true;
      }
    }

    if (needsPatch) {
      try {
        await client.patch(project._id).set(patchData).commit();
        
        // Also update draft copy if it exists
        const draftId = `drafts.${project._id}`;
        const draftExists = await client.getDocument(draftId);
        if (draftExists) {
          await client.patch(draftId).set(patchData).commit();
          console.log(`   └─ Draft document updated as well`);
        }

        console.log(`✅ Successfully fixed project gallery for: "${project.title}"\n`);
        fixCount++;
      } catch (err) {
        console.error(`❌ Failed to update project "${project.title}":`, err.message);
      }
    }
  }

  console.log(`Scan and fix complete. Fixed ${fixCount} projects.`);
}

run().catch(console.error);
