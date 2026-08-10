import fs from 'fs';
import { createClient } from '@sanity/client';
import sharp from 'sharp';

// Load environment variables manually from .env.local
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
  const env = loadEnv('.env.local');
  const token = process.env.SANITY_API_TOKEN || env.SANITY_API_TOKEN;
  
  if (!token) {
    console.error('Error: SANITY_API_TOKEN is missing in .env.local');
    process.exit(1);
  }

  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'x16t7huo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-16',
    token: token,
    useCdn: false,
  });

  const sourceImagePath = 'C:\\Users\\IT_COMMS\\Desktop\\WhatsApp Image 2026-08-10 at 12.49.19.jpeg';
  const tempJpegPath = 'C:\\Users\\IT_COMMS\\Desktop\\acob-driver-employment.jpg';

  console.log(`Checking if source image exists at: ${sourceImagePath}`);
  if (!fs.existsSync(sourceImagePath)) {
    console.error(`Error: Source image not found at ${sourceImagePath}`);
    process.exit(1);
  }

  console.log('Optimizing image using sharp (JPEG, max 2560px, 80% quality)...');
  await sharp(sourceImagePath)
    .resize({
      width: 2560,
      height: 2560,
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toFile(tempJpegPath);
  console.log(`Optimized image saved temporarily to: ${tempJpegPath}`);

  console.log('Uploading optimized image asset to Sanity...');
  const imageAsset = await client.assets.upload('image', fs.createReadStream(tempJpegPath), {
    filename: 'acob-driver-employment.jpg',
    contentType: 'image/jpeg',
  });
  console.log(`Successfully uploaded image asset. Asset ID: ${imageAsset._id}`);

  console.log('Inserting Company Driver job posting document into Sanity...');
  const jobDoc = {
    _type: 'jobPosting',
    _id: 'job-posting-company-driver',
    title: 'Company Driver',
    department: 'Operations',
    location: 'Abuja',
    employmentType: 'full-time',
    description: "The Driver will be responsible for the safe and timely transportation of staff for official duties, as well as supporting the company's procurement and logistics activities. The role requires a reliable, safety-conscious individual with good knowledge of Abuja roads and traffic regulations, who will represent the company professionally while carrying out official assignments.",
    keyDuties: [
      "Drive staff to and from meetings, official engagements, and other work-related locations.",
      "Support procurement and logistics activities by transporting personnel, materials, and equipment as required.",
      "Ensure the assigned vehicle is clean, fueled, and in good working condition at all times.",
      "Conduct routine vehicle inspections and promptly report any faults or maintenance needs.",
      "Maintain accurate records of trips, mileage, fuel consumption, and vehicle maintenance.",
      "Ensure compliance with traffic laws, road safety regulations, and company driving policies.",
      "Ensure the safety and security of staff, company assets, and goods during transit."
    ],
    requirements: [
      "Age: 30 – 40 years",
      "Minimum of SSCE qualification.",
      "Minimum of 3–5 years’ driving experience as a company or corporate driver.",
      "Valid Driver’s License.",
      "Married.",
      "Good knowledge of Abuja roads, traffic regulations, and road safety practices."
    ],
    skills: [
      "Strong sense of responsibility, punctuality, and integrity.",
      "Good communication and interpersonal skills.",
      "Ability to carry out basic vehicle maintenance checks.",
      "Ability to work under pressure and outside regular hours.",
      "Must be physically fit and alert at all times."
    ],
    howToApply: "Interested and qualified candidates should send their updated CV to jobs@acoblighting.com with the job title as the subject of the email.",
    applicationDeadline: '2026-08-12',
    isActive: true,
    publishedAt: new Date().toISOString(),
    slug: {
      _type: 'slug',
      current: 'company-driver'
    },
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAsset._id
      },
      alt: 'ACOB Lighting hiring poster for the role of Company Driver in Abuja.'
    }
  };

  await client.createOrReplace(jobDoc);
  console.log('Successfully created/replaced Job Posting document in Sanity!');

  console.log('Cleaning up temporary JPEG file...');
  fs.unlinkSync(tempJpegPath);
  console.log('Done!');
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
