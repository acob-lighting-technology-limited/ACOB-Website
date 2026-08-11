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

  const jobsToCreate = [
    {
      id: 'job-posting-business-development-officer',
      title: 'Business Development Officer',
      slug: 'business-development-officer',
      department: 'Business Development',
      location: 'Abuja',
      employmentType: 'full-time',
      sourceImagePath: 'C:\\Users\\IT_COMMS\\Desktop\\WhatsApp Image 2026-08-11 at 12.05.41.jpeg',
      tempJpegPath: 'C:\\Users\\IT_COMMS\\Desktop\\acob-business-development-officer-hiring.jpg',
      imageFilename: 'acob-business-development-officer-hiring.jpg',
      imageAlt: 'ACOB Lighting hiring poster for the role of Business Development Officer in Abuja.',
      description: "The Business Development Officer will be responsible for identifying and developing business opportunities that drive the growth of ACOB Lighting Technology Limited's renewable energy portfolio, especially in Productive Use of Energy (PUE). The role involves developing and managing strategic partnerships, expanding market opportunities, managing energy-related business projects, and contributing to the commercialization of renewable energy solutions. The ideal candidate should possess strong business development skills with proven experience in renewable energy markets, energy business management, and project commercialization.",
      keyDuties: [
        "Identify, develop, and pursue new business opportunities within the renewable energy sector.",
        "Develop and implement business development strategies to drive revenue growth and market expansion.",
        "Build and maintain strategic relationships with clients, partners, and industry stakeholders.",
        "Identify funding opportunities, strategic partnerships, and investment prospects to support the company's business growth objectives.",
        "Conduct market research, competitor analysis, and feasibility studies to identify emerging business opportunities.",
        "Develop business proposals and bid documents for prospective projects.",
        "Collaborate with technical and project teams to ensure successful implementation of business development initiatives.",
        "Develop sustainable business models, financing strategies, and payment plans for renewable energy projects.",
        "Represent ACOB at relevant industry events, forums, and stakeholder engagements.",
        "Conduct business and financial assessments to support project viability and investment decisions.",
        "Monitor business performance and prepare periodic business development reports for management."
      ],
      requirements: [
        "BSc in Business Administration, Economics, Marketing, Renewable Energy, or related discipline.",
        "Minimum of 3–5 years relevant experience in business development, with experience in Productive Use of Energy (PUE) business management.",
        "Experience working in the Renewable Energy sector is highly desirable."
      ],
      skills: [
        "Strong business development and strategic planning skills.",
        "Experience in energy business management and renewable energy markets.",
        "Understanding in how renewable energy powers income-generating activities.",
        "Knowledge of business modelling, financial analysis, and project feasibility assessment.",
        "Ability to develop business proposals, bid documents, and tender submissions for prospective projects.",
        "Proficiency in market research, data analysis, and business performance reporting.",
        "Working knowledge of Nigeria's renewable energy market, regulatory environment, and industry trends.",
        "Experience developing customer payment plans and financing models for renewable energy projects.",
        "Strong stakeholder engagement and coordination skills.",
        "Knowledge of Productive Use of Energy (PUE).",
        "Strong networking and relationship-building abilities.",
        "Ability to identify and capitalize on emerging business opportunities.",
        "Strong analytical and commercial acumen.",
        "High level of initiative, professionalism, and result orientation.",
        "Excellent communication and presentation skills.",
        "Ability to manage multiple tasks and meet deadlines."
      ]
    },
    {
      id: 'job-posting-project-officer-supervisor',
      title: 'Project Officer / Supervisor',
      slug: 'project-officer-supervisor',
      department: 'Engineering & Operations',
      location: 'Abuja',
      employmentType: 'full-time',
      sourceImagePath: 'C:\\Users\\IT_COMMS\\Desktop\\WhatsApp Image 2026-08-11 at 12.05.41 ass.jpeg',
      tempJpegPath: 'C:\\Users\\IT_COMMS\\Desktop\\acob-project-officer-supervisor-hiring.jpg',
      imageFilename: 'acob-project-officer-supervisor-hiring.jpg',
      imageAlt: 'ACOB Lighting hiring poster for the role of Project Officer / Supervisor in Abuja.',
      description: "The Project Officer/Supervisor will be responsible for managing and coordinating large scale Solar Electrification projects from planning through implementation and post-deployment support. The role involves overseeing project execution, supporting project planning & applications, conducting project assessments, developing sustainable project monitoring and management modalities, and ensuring the successful delivery of renewable energy projects. The ideal candidate should possess strong project management skills and proven experience in isolated & interconnected mini-grid projects, streetlighting infrastructure, usage of System Simulation Designs & Project planning tools, and have general renewable energy project deployment experience.",
      keyDuties: [
        "Plan, coordinate, and supervise small, medium & large scale solar mini-grids and renewable energy related projects from inception to completion.",
        "Conduct in-depth project specific assessments, and develop high-level technical reports.",
        "Develop and implement project work plans, schedules, and budgets.",
        "Conduct advance site mapping & desk research using tools such as VIDA, SE4ALL Webmap, Google-Earth etc.",
        "Track project progress and prepare periodic status reports to Line Manager.",
        "Support Project development design preparations & applications using Odyssey, Homer & other advanced simulation tools.",
        "Coordinate project implementation with field teams, contractors, and community stakeholders.",
        "Monitor project performance and ensure compliance with approved scope, timelines, and quality standards.",
        "Identify project risks and implement appropriate mitigation measures.",
        "Ensure proper project documentation, monitoring, and close-out activities."
      ],
      requirements: [
        "Bachelor’s Degree (BEng) in Engineering (Electrical, Engineering Management, and any other related fields).",
        "Experience in Renewable Energy projects and mini-grid development or deployment is highly desirable.",
        "Minimum of 3–5 years' relevant experience in project management, project supervision, or renewable energy project implementation.",
        "Certification in COREN MGD (Mini-Grid Design) will be an added advantage."
      ],
      skills: [
        "Sound project management skills, including planning, scheduling, resource allocation, supervision, and execution.",
        "Strong knowledge of project design principles, particularly for mini-grid, PUE, and renewable energy systems.",
        "Experience in developing customer payment plans or financing models for renewable energy projects.",
        "Proficiency in Odyssey simulation software for project planning, modelling, and feasibility assessment.",
        "Proficiency in project monitoring and evaluation methodologies.",
        "Ability to monitor project performance, track progress, and prepare project reports.",
        "Working knowledge of relevant engineering standards, regulatory requirements, and industry best practices.",
        "Strong analytical and problem-solving skills.",
        "Excellent organizational and planning abilities.",
        "Effective communication and reporting skills.",
        "Strong stakeholder engagement and coordination skills.",
        "Ability to manage multiple tasks and meet deadlines.",
        "Attention to detail and commitment to quality.",
        "Ability to work independently and lead project teams."
      ]
    }
  ];

  for (const job of jobsToCreate) {
    console.log(`\n----------------------------------------`);
    console.log(`Processing: ${job.title}`);
    console.log(`Checking if source image exists at: ${job.sourceImagePath}`);
    if (!fs.existsSync(job.sourceImagePath)) {
      console.error(`Error: Source image not found at ${job.sourceImagePath}`);
      continue;
    }

    console.log('Optimizing image using sharp (JPEG, max 2560px, 80% quality)...');
    await sharp(job.sourceImagePath)
      .resize({
        width: 2560,
        height: 2560,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(job.tempJpegPath);
    console.log(`Optimized image saved temporarily to: ${job.tempJpegPath}`);

    console.log('Uploading optimized image asset to Sanity...');
    const imageAsset = await client.assets.upload('image', fs.createReadStream(job.tempJpegPath), {
      filename: job.imageFilename,
      contentType: 'image/jpeg',
    });
    console.log(`Successfully uploaded image asset. Asset ID: ${imageAsset._id}`);

    console.log(`Inserting ${job.title} job posting document into Sanity...`);
    const jobDoc = {
      _type: 'jobPosting',
      _id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      description: job.description,
      keyDuties: job.keyDuties,
      requirements: job.requirements,
      skills: job.skills,
      howToApply: "Interested and qualified candidates should send their updated CV to jobs@acoblighting.com with the job title as the subject of the email.",
      applicationDeadline: '2026-08-13',
      isActive: true,
      publishedAt: new Date().toISOString(),
      slug: {
        _type: 'slug',
        current: job.slug
      },
      coverImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        },
        alt: job.imageAlt
      }
    };

    await client.createOrReplace(jobDoc);
    console.log(`Successfully created/replaced Job Posting document for ${job.title} in Sanity!`);

    console.log('Cleaning up temporary JPEG file...');
    fs.unlinkSync(job.tempJpegPath);
    console.log(`Finished ${job.title}`);
  }

  console.log('\nAll done!');
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
