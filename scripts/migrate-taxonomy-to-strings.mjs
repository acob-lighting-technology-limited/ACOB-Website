/**
 * migrate-taxonomy-to-strings.mjs
 *
 * One-time migration: converts reference-based categories and tags
 * in Sanity documents back to plain slug strings.
 *
 * Before: categories: [{_ref: 'category-mini-grids', _type: 'reference'}]
 * After:  categories: ['mini-grids']
 *
 * Run with: node scripts/migrate-taxonomy-to-strings.mjs
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
const envPath = resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ============================================================================
// BUILD LOOKUP MAPS FROM EXISTING CATEGORY/TAG DOCUMENTS
// ============================================================================

async function buildLookupMaps() {
  const categories = await client.fetch(`*[_type == "category"]{ _id, "slug": slug.current, title }`);
  const tags = await client.fetch(`*[_type == "tag"]{ _id, "slug": slug.current, title }`);

  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat._id] = cat.slug;
  }

  const tagMap = {};
  for (const tag of tags) {
    tagMap[tag._id] = tag.slug;
  }

  console.log(`\nFound ${categories.length} category documents`);
  console.log(`Found ${tags.length} tag documents`);
  console.log('\nCategory lookup:');
  for (const [id, slug] of Object.entries(categoryMap)) console.log(`  ${id} → ${slug}`);

  return { categoryMap, tagMap };
}

// ============================================================================
// RESOLVE ARRAY OF REFERENCES OR STRINGS TO PLAIN STRINGS
// ============================================================================

function resolveArray(arr, lookupMap) {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const resolved = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      resolved.push(item);
    } else if (item && item._type === 'reference' && item._ref) {
      const slug = lookupMap[item._ref];
      if (slug) {
        resolved.push(slug);
      } else {
        console.warn(`  ⚠️  Could not resolve reference: ${item._ref}`);
      }
    }
  }
  return resolved.length > 0 ? resolved : null;
}

// ============================================================================
// MIGRATE A DOCUMENT TYPE
// ============================================================================

async function migrateDocumentType(docType, categoryMap, tagMap) {
  console.log(`\n========================================`);
  console.log(`Migrating ${docType.toUpperCase()}...`);
  console.log(`========================================`);

  const docs = await client.fetch(
    `*[_type == $docType]{ _id, title, categories, tags }`,
    { docType }
  );

  console.log(`Found ${docs.length} documents to check`);

  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const patch = {};
    let needsPatch = false;

    if (Array.isArray(doc.categories) && doc.categories.length > 0) {
      const firstItem = doc.categories[0];
      if (typeof firstItem !== 'string') {
        const resolved = resolveArray(doc.categories, categoryMap);
        if (resolved) { patch.categories = resolved; needsPatch = true; }
      }
    }

    if (Array.isArray(doc.tags) && doc.tags.length > 0) {
      const firstItem = doc.tags[0];
      if (typeof firstItem !== 'string') {
        const resolved = resolveArray(doc.tags, tagMap);
        if (resolved) { patch.tags = resolved; needsPatch = true; }
      }
    }

    if (needsPatch) {
      try {
        await client.patch(doc._id).set(patch).commit();
        console.log(`  ✅ "${doc.title}"`);
        if (patch.categories) console.log(`     categories: [${patch.categories.join(', ')}]`);
        if (patch.tags) console.log(`     tags: [${patch.tags.join(', ')}]`);
        updated++;
      } catch (err) {
        console.error(`  ❌ Failed: ${doc._id} — ${err.message}`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n${docType}: ${updated} updated, ${skipped} already up to date`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('=== Taxonomy Migration: References → Plain Strings ===');
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);

  if (!process.env.SANITY_API_TOKEN) {
    console.error('\n❌ SANITY_API_TOKEN is not set in .env.local');
    process.exit(1);
  }

  const { categoryMap, tagMap } = await buildLookupMaps();
  await migrateDocumentType('project', categoryMap, tagMap);
  await migrateDocumentType('updatePost', categoryMap, tagMap);

  console.log('\n✅ Migration complete!');
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
