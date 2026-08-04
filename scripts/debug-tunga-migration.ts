import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const { writeClient } = await import('../sanity/lib/config');
    const documents = await writeClient.fetch<Record<string, unknown>[]>(`
      *[_type == "project" && slug.current == "tunga-300-kwp-hybrid-mini-grid-project-for-rural-electrification-nasarawa-state-nigeria"] {
        _id,
        _type,
        title,
        slug,
        projectImage {
          _type,
          alt,
          asset-> { _id, url, originalFilename, size, mimeType }
        },
        projectContent {
          images[] {
            ...,
            asset-> { _id, url, originalFilename, size, mimeType }
          }
        }
      }
    `);

    const doc = documents[0];
    console.log('Fetched Tunga document for migration check:');
    console.log(JSON.stringify(doc, null, 2));

    if (doc.projectContent?.images) {
      console.log(
        `\nFound ${doc.projectContent.images.length} gallery images.`,
      );
      doc.projectContent.images.forEach(
        (item: Record<string, unknown>, i: number) => {
          console.log(`Image [${i + 1}]:`);
          console.log('  item.asset:', item.asset ? 'Defined' : 'Undefined');
          if (item.asset) {
            const asset = item.asset;
            const sizeKB = asset.size ? asset.size / 1024 : 0;
            const isMimeJpg =
              asset.mimeType === 'image/jpeg' || asset.mimeType === 'image/jpg';
            const isCleanName =
              asset.originalFilename?.startsWith('acob-') &&
              asset.originalFilename?.endsWith('.jpg');
            console.log('  asset._id:', asset._id);
            console.log('  asset.originalFilename:', asset.originalFilename);
            console.log('  asset.sizeKB:', sizeKB);
            console.log('  asset.mimeType:', asset.mimeType);
            console.log('  isMimeJpg:', isMimeJpg);
            console.log('  isCleanName:', isCleanName);
            const isOptimized = isMimeJpg && sizeKB < 350 && isCleanName;
            console.log('  isAlreadyOptimized:', isOptimized);
          }
        },
      );
    } else {
      console.log('\nNo projectContent.images found.');
    }
  } catch (err) {
    console.error(err);
  }
}
main();
