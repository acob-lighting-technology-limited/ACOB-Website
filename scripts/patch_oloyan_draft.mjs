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

  const id = 'be319b6e-39c6-42bd-9e03-11e25efae4f4';
  const draftId = `drafts.${id}`;

  const project = await client.getDocument(draftId);
  if (!project) {
    console.log('No draft found for Oloyan Community.');
    return;
  }

  const patchData = {};
  const title = project.title || "Oloyan Community 100 kWp Hybrid Solar Mini-Grid Project for Rural Electrification, Edo State, Nigeria";

  // Check main image
  if (project.projectImage && project.projectImage.asset) {
    patchData.projectImage = {
      ...project.projectImage,
      alt: title
    };
  }

  // Check gallery images
  if (project.projectContent && Array.isArray(project.projectContent.images)) {
    const updatedImages = project.projectContent.images.map((img, index) => {
      const typeStr = img._type || 'image';
      const mediaLabel = typeStr === 'video' ? 'Video Walkthrough' : 'Installation Photo';
      const altText = `${title} - ${mediaLabel} ${index + 1}`;
      return {
        ...img,
        alt: altText
      };
    });
    patchData.projectContent = {
      ...project.projectContent,
      images: updatedImages
    };
  }

  await client.patch(draftId).set(patchData).commit();
  console.log(`Successfully patched draft document for: "${title}"`);
}

run().catch(console.error);
