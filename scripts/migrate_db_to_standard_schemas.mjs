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

const CATEGORY_MAP = {
  // Project Categories
  'rural-electrification': 'Rural Electrification',
  'mini-grids': 'Mini-Grids',
  'commercial-installations': 'Commercial Installations',
  'street-lighting': 'Street Lighting',
  'healthcare-projects': 'Healthcare Projects',
  'pue': 'Productive Use of Energy (PUE)',
  // Update Categories
  'announcements': 'Announcements',
  'case-studies': 'Case Studies',
  'press-releases': 'Press Releases',
  'events': 'Events',
  'celebrations': 'Celebrations',
  'news': 'Announcements' // Map legacy news category to announcements
};

const TAG_MAP = {
  'solar-energy': 'Solar Energy',
  'mini-grid': 'Mini-Grid',
  'street-lighting': 'Street Lighting',
  'rural-electrification': 'Rural Electrification',
  'sustainability': 'Sustainability',
  'renewable-energy': 'Renewable Energy',
  'community-impact': 'Community Impact',
  'energy-access': 'Energy Access',
  'off-grid': 'Off-Grid',
  'installation': 'Installation',
  'technology': 'Technology',
  'innovation': 'Innovation',
  'partnership': 'Partnership',
  'training': 'Training',
  'maintenance': 'Maintenance'
};

async function run() {
  const env = loadEnv('C:\\Users\\IT_COMMS\\.env.local');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: env.SANITY_API_TOKEN || 'skAFjnxe4tjVIElvHX8JlaHGEAh1G3ayOzkF7DLivuUlAU3e5GbBeyKDbWWSJyJ8fZJ3FBpCKhpcjpQqdNfuE5hbaOrzLDa6Eurf3bUfzR23DeXbJex5XJJQ2J2PgEN63bvDXLvYJfqbhd9J0vuKqeF2Zujvo9WYnAkGWqvrhBHEOYIndCp6',
    useCdn: false,
  });

  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log('🧪 DRY RUN MODE - No database changes will be committed.\n');
  } else {
    console.log('🚀 LIVE MIGRATION MODE - Writing updates to Sanity database...\n');
  }

  // ==========================================
  // 1. CREATE DYNAMIC TAXONOMY DOCUMENTS
  // ==========================================
  console.log('--- Step 1: Dynamic Taxonomy Setup ---');
  
  // Author
  const authorId = 'author-acob-lighting';
  console.log(`Setting up Author: "ACOB LIGHTING" (${authorId})`);
  if (!isDryRun) {
    await client.createOrReplace({
      _id: authorId,
      _type: 'author',
      name: 'ACOB LIGHTING'
    });
  }

  // Categories
  for (const [slug, title] of Object.entries(CATEGORY_MAP)) {
    const docId = `category-${slug}`;
    console.log(`Setting up Category: "${title}" (${docId})`);
    if (!isDryRun) {
      await client.createOrReplace({
        _id: docId,
        _type: 'category',
        title: title,
        slug: { _type: 'slug', current: slug }
      });
    }
  }

  // Tags
  for (const [slug, title] of Object.entries(TAG_MAP)) {
    const docId = `tag-${slug}`;
    console.log(`Setting up Tag: "${title}" (${docId})`);
    if (!isDryRun) {
      await client.createOrReplace({
        _id: docId,
        _type: 'tag',
        title: title,
        slug: { _type: 'slug', current: slug }
      });
    }
  }
  console.log('✅ Taxonomy documents set up.\n');

  // ==========================================
  // 2. MIGRATE PROJECTS
  // ==========================================
  console.log('--- Step 2: Migrating Projects ---');
  const projects = await client.fetch(`*[_type == "project"]`);
  console.log(`Found ${projects.length} projects to migrate.`);

  for (const p of projects) {
    const isDraft = p._id.startsWith('drafts.');
    const patchData = {};
    const unsetData = [];

    // Naming migration: projectImage -> coverImage
    if (p.projectImage) {
      patchData.coverImage = {
        _type: 'image',
        asset: p.projectImage.asset,
        alt: p.projectImage.alt || p.title
      };
      unsetData.push('projectImage');
    }

    // Naming migration: projectDate -> publishedAt
    if (p.projectDate) {
      patchData.publishedAt = `${p.projectDate}T12:00:00.000Z`;
      unsetData.push('projectDate');
    }

    // Flattening: projectContent -> root fields
    if (p.projectContent) {
      if (p.projectContent.description) {
        patchData.descriptionTemplate = p.projectContent.description;
      }
      if (p.projectContent.customDescription) {
        patchData.content = p.projectContent.customDescription;
      }
      if (p.projectContent.images) {
        patchData.gallery = p.projectContent.images;
      }
      unsetData.push('projectContent');
    }

    // Taxonomy migration: categories array references
    if (Array.isArray(p.categories)) {
      patchData.categories = p.categories.map(cat => {
        if (typeof cat === 'string') {
          return {
            _type: 'reference',
            _ref: `category-${cat}`,
            _key: Math.random().toString(36).substring(2, 9)
          };
        } else if (cat && cat._ref) {
          return cat;
        }
        return null;
      }).filter(Boolean);
    }

    // Clean up category (singular) just in case
    if (p.category) {
      unsetData.push('category');
    }

    console.log(`Project: "${p.title}" ${isDraft ? '(Draft)' : ''}`);

    if (!isDryRun) {
      const patch = client.patch(p._id).set(patchData);
      if (unsetData.length > 0) {
        patch.unset(unsetData);
      }
      await patch.commit();
    }
  }
  console.log('✅ Projects migration completed.\n');

  // ==========================================
  // 3. MIGRATE UPDATES (Keeping updatePost type, patching in place)
  // ==========================================
  console.log('--- Step 3: Migrating Update Posts (In-place patch) ---');
  const posts = await client.fetch(`*[_type == "updatePost"]`);
  console.log(`Found ${posts.length} update posts to migrate.`);

  for (const post of posts) {
    const isDraft = post._id.startsWith('drafts.');
    const patchData = {
      author: {
        _type: 'reference',
        _ref: authorId
      }
    };
    const unsetData = [];

    // Naming migration: featuredImage -> coverImage
    if (post.featuredImage) {
      patchData.coverImage = {
        _type: 'image',
        asset: post.featuredImage.asset,
        alt: post.featuredImage.alt || post.title
      };
      unsetData.push('featuredImage');
    }

    // Taxonomy migration: category (string) -> categories (array of references)
    if (post.category && typeof post.category === 'string') {
      let catSlug = post.category;
      if (catSlug === 'news') catSlug = 'announcements';
      patchData.categories = [
        {
          _type: 'reference',
          _ref: `category-${catSlug}`,
          _key: Math.random().toString(36).substring(2, 9)
        }
      ];
      unsetData.push('category');
    } else if (post.categories) {
      // If categories already exists, let's make sure it contains valid objects
      patchData.categories = post.categories.map(cat => {
        if (typeof cat === 'string') {
          return {
            _type: 'reference',
            _ref: `category-${cat}`,
            _key: Math.random().toString(36).substring(2, 9)
          };
        } else if (cat && cat._ref) {
          return cat;
        }
        return null;
      }).filter(Boolean);
    }

    // Taxonomy migration: tags (strings) -> tags (array of references)
    if (Array.isArray(post.tags)) {
      patchData.tags = post.tags.map(tag => {
        if (typeof tag === 'string') {
          return {
            _type: 'reference',
            _ref: `tag-${tag}`,
            _key: Math.random().toString(36).substring(2, 9)
          };
        } else if (tag && tag._ref) {
          return tag;
        }
        return null;
      }).filter(Boolean);
    }

    console.log(`Update: "${post.title}" ${isDraft ? '(Draft)' : ''}`);

    if (!isDryRun) {
      const patch = client.patch(post._id).set(patchData);
      if (unsetData.length > 0) {
        patch.unset(unsetData);
      }
      await patch.commit();
    }
  }
  console.log('✅ Updates migration completed.');
}

run().catch(console.error);
