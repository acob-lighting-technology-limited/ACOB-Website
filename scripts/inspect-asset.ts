import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const { writeClient } = await import('../sanity/lib/config');
    const asset = await writeClient.fetch(
      '*[_type == "sanity.imageAsset" && originalFilename == "acob-tunga-300-kwp-hybrid-mini-grid-project-for-rural-electrification-nasarawa-state-nigeria-gallery-image-1.jpg"][0]',
    );
    console.log('\n--- SANITY ASSET BY FILENAME ---\n');
    console.log(JSON.stringify(asset, null, 2));
  } catch (err) {
    console.error(err);
  }
}
main();
