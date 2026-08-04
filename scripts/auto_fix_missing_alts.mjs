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
    projectImage,
    projectContent
  }`);

  console.log(`Found ${projects.length} total projects. Scanning for missing alt texts to auto-fix...\n`);

  let fixCount = 0;

  for (const project of projects) {
    let needsPatch = false;
    const patchData = {};

    // 1. Check main projectImage
    if (project.projectImage && project.projectImage.asset) {
      if (!project.projectImage.alt || !project.projectImage.alt.trim()) {
        const altText = project.title;
        patchData.projectImage = {
          ...project.projectImage,
          alt: altText
        };
        needsPatch = true;
        console.log(`✏️ Queued Main Image Alt for "${project.title}": "${altText}"`);
      }
    }

    // 2. Check gallery images/videos
    if (project.projectContent && Array.isArray(project.projectContent.images)) {
      let galleryChanged = false;
      const updatedImages = project.projectContent.images.map((img, index) => {
        const typeStr = img._type || 'image';
        if (!img.alt || !img.alt.trim()) {
          galleryChanged = true;
          const mediaLabel = typeStr === 'video' ? 'Video Walkthrough' : 'Installation Photo';
          const altText = `${project.title} - ${mediaLabel} ${index + 1}`;
          console.log(`  ✏️ Queued Gallery ${typeStr} Alt at index ${index}: "${altText}"`);
          return {
            ...img,
            alt: altText
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

    // Apply patch if needed
    if (needsPatch) {
      try {
        await client.patch(project._id).set(patchData).commit();
        console.log(`✅ Successfully updated project: "${project.title}"\n`);
        fixCount++;
      } catch (err) {
        console.error(`❌ Failed to update project "${project.title}":`, err.message);
      }
    }
  }

  console.log(`Auto-fix complete. Patched ${fixCount} projects.`);
}

run().catch(console.error);
