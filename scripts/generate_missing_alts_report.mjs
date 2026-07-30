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

  let markdown = `# Audit: Missing Image Alt Texts in Sanity Projects\n\n`;
  markdown += `This report outlines all projects in Sanity that are currently missing alt texts for either their main project card image or their gallery images/videos.\n\n`;

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
      markdown += `### ❌ [${project.title}](http://localhost:3000/studio/structure/projects;${project._id})\n`;
      markdown += `* **Slug**: \`${project.slug?.current || 'N/A'}\`\n`;
      issues.forEach(issue => {
        markdown += `* ⚠️ ${issue}\n`;
      });
      markdown += `\n---\n\n`;
    }
  }

  markdown += `\n**Audit Summary**: Found ${count} projects out of ${projects.length} with missing alt texts or missing images.\n`;

  const reportPath = 'C:\\Users\\IT_COMMS\\.gemini\\antigravity\\brain\\c98f3380-4e98-4297-a3d7-f2f2815de26a\\missing_alts_report.md';
  fs.writeFileSync(reportPath, markdown, 'utf8');
  console.log(`Report successfully written to ${reportPath}`);
}

run().catch(console.error);
