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
  const env = loadEnv('C:\\Users\\IT_COMMS\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const updates = await client.fetch(`*[_type == "updatePost" && _id in [
    "updatePost-interconnected-grids-july-2026",
    "updatePost-energy-audit-july-2026",
    "updatePost-solar-storage-july-2026",
    "updatePost-hello-july-2026"
  ]] {
    _id,
    title,
    slug,
    excerpt,
    content
  }`);

  for (const post of updates) {
    console.log(`=========================================`);
    console.log(`TITLE: "${post.title}"`);
    console.log(`SLUG: "${post.slug?.current}"`);
    console.log(`EXCERPT (${post.excerpt?.length} chars): "${post.excerpt}"`);
    console.log(`CONTENT BLOCKS COUNT: ${post.content ? post.content.length : 0}`);
    
    if (post.content && post.content.length > 0) {
      const textBlocks = post.content.filter(b => b._type === 'block');
      const imageBlocks = post.content.filter(b => b._type === 'image');
      const videoBlocks = post.content.filter(b => b._type === 'video');
      
      console.log(`  - Text Blocks: ${textBlocks.length}`);
      console.log(`  - Image Blocks: ${imageBlocks.length}`);
      console.log(`  - Video Blocks: ${videoBlocks.length}`);
      
      // Print first text block content snippet
      if (textBlocks.length > 0) {
        const text = textBlocks.map(b => b.children ? b.children.map(c => c.text).join('') : '').join(' ');
        console.log(`  - Content Snippet: "${text.substring(0, 150)}..."`);
      }
    }
    console.log();
  }
}

run().catch(console.error);
