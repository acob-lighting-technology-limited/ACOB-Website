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

  const posts = await client.fetch(`*[_type == "updatePost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    category,
    tags,
    featuredImage
  }`);

  console.log(`Auditing ${posts.length} total Update Posts for standardization...\n`);

  const allowedCategories = ['announcements', 'case-studies', 'press-releases', 'events', 'celebrations'];
  
  posts.forEach((post, index) => {
    const issues = [];
    
    // Check ID pattern
    const isStandardId = post._id.startsWith('updatePost-');
    if (!isStandardId) {
      issues.push(`Non-standard ID: "${post._id}" (auto-generated ID instead of prefix updatePost-*)`);
    }

    // Check slug
    if (!post.slug || !post.slug.current) {
      issues.push("Missing slug");
    }

    // Check excerpt
    if (!post.excerpt) {
      issues.push("Missing excerpt");
    } else if (post.excerpt.length > 200) {
      issues.push(`Excerpt too long (${post.excerpt.length} chars, max is 200)`);
    }

    // Check category
    if (!post.category) {
      issues.push("Missing category");
    } else if (!allowedCategories.includes(post.category)) {
      issues.push(`Invalid category: "${post.category}" (not in allowed list)`);
    }

    // Check tags
    if (!post.tags || post.tags.length === 0) {
      issues.push("Missing tags");
    }

    // Check featuredImage
    if (!post.featuredImage || !post.featuredImage.asset) {
      issues.push("Missing featured image");
    } else if (!post.featuredImage.alt || !post.featuredImage.alt.trim()) {
      issues.push("Featured image is missing alt text");
    }

    const status = issues.length === 0 ? "🟢 Standardized" : "🔴 Unstandardized";
    console.log(`Post #${index + 1}: "${post.title}" [${status}]`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   - ⚠️ ${issue}`));
    }
    console.log();
  });
}

run().catch(console.error);
