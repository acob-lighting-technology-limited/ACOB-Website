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
    slug,
    projectImage,
    projectContent
  }`);

  console.log(`Found ${projects.length} total projects. Checking for missing alt texts...\n`);

  let count = 0;
  for (const project of projects) {
    const issues = [];

    // Check main projectImage
    if (project.projectImage) {
      if (!project.projectImage.alt || !project.projectImage.alt.trim()) {
        issues.push(`Main project image is missing alt text`);
      }
    } else {
      issues.push(`Main project image is missing (no image uploaded)`);
    }

    // Check gallery images
    if (project.projectContent && Array.isArray(project.projectContent.images)) {
      project.projectContent.images.forEach((img, index) => {
        const typeStr = img._type || 'item';
        if (!img.alt || !img.alt.trim()) {
          issues.push(`Gallery ${typeStr} at index ${index} is missing alt text`);
        }
      });
    }

    if (issues.length > 0) {
      count++;
      console.log(`❌ Project: "${project.title}"`);
      console.log(`   Slug: ${project.slug?.current || 'N/A'}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log();
    }
  }

  console.log(`Check complete. Found ${count} projects with alt text or image issues.`);
}

run().catch(console.error);
