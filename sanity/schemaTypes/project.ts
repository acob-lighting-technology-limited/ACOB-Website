/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineField, defineType } from 'sanity';
import { PackageIcon } from '@sanity/icons';
import {
  orderRankField,
  orderRankOrdering,
} from '@sanity/orderable-document-list';
import { TitleFieldWithGenerate } from '../components/TitleFieldWithGenerate';
import { ExcerptFieldWithGenerate } from '../components/ExcerptFieldWithGenerate';
import { DescriptionTemplatePreview } from '../components/DescriptionTemplatePreview';
import { PROJECT_CATEGORY_OPTIONS } from '../constants/taxonomy';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: PackageIcon,
  groups: [
    { name: 'general', title: '📋 General Info' },
    { name: 'technical', title: '⚙️ Technical Specs' },
    { name: 'location', title: '🌍 Location & GPS' },
    { name: 'impact', title: '📈 Impact Metrics' },
    { name: 'content', title: '📝 Narrative & Media' },
  ],
  orderings: [
    orderRankOrdering,
    {
      title: 'Project Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Project Date, Old',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Creation Date, New',
      name: 'createdAtDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  fields: [
    // Add orderRank field for drag-and-drop functionality
    orderRankField({ type: 'project', hidden: true }),

    // ===================================================
    // GENERAL GROUP
    // ===================================================
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'general',
      description:
        'Project title (click "Generate" to auto-generate from project details)',
      validation: Rule => Rule.required(),
      components: {
        input: TitleFieldWithGenerate,
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'general',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'general',
      description:
        'A short summary of the project (click "Generate" to auto-generate from project details. Recommended: 150-200 characters)',
      validation: Rule =>
        Rule.max(200).warning('Excerpt should be under 200 characters'),
      components: {
        input: ExcerptFieldWithGenerate,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Project Categories',
      type: 'array',
      group: 'general',
      of: [{ type: 'string' }],
      options: {
        list: [...PROJECT_CATEGORY_OPTIONS],
        layout: 'list',
      },
      description:
        'A project can belong to multiple categories (e.g. both "Rural Electrification" and "Mini-Grids"). To add a new category, update sanity/constants/taxonomy.ts in code.',
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'general',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'Free-form tags (e.g. "solar-pv", "battery-storage"). Press Enter to add each tag.',
    }),
    defineField({
      name: 'subcategory',
      title: 'Sub-category',
      type: 'string',
      group: 'general',
      description:
        'Only applies to categories that have sub-types (Mini-Grids, Commercial Installations, Healthcare, PUE).',
      hidden: ({ parent }: { parent?: { categories?: string[] } }) => {
        const cats: string[] = parent?.categories || [];
        return !cats.some(c =>
          [
            'mini-grids',
            'commercial-installations',
            'healthcare-projects',
            'pue',
          ].includes(c),
        );
      },
      options: {
        list: [
          { title: 'Isolated', value: 'isolated' },
          { title: 'Interconnected', value: 'interconnected' },
          { title: 'Residential', value: 'residential' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Primary Healthcare', value: 'primary' },
          { title: 'Secondary Healthcare', value: 'secondary' },
          { title: 'Tertiary Healthcare', value: 'tertiary' },
          { title: 'EV Charging', value: 'ev-charging' },
          { title: 'Irrigation', value: 'irrigation' },
          { title: 'CNG', value: 'cng' },
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Project Date',
      type: 'datetime',
      group: 'general',
      description: 'The date when the project was completed or launched',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Project',
      type: 'boolean',
      group: 'general',
      description:
        'Toggle to feature this project in the hero section (Min 4, Max 10 projects). Use "Featured Projects Order" in the sidebar to drag and reorder.',
      initialValue: false,
      validation: Rule =>
        Rule.custom(async (value, context) => {
          if (value === undefined) {
            return true;
          }

          const { getClient } = context;
          const client = getClient({ apiVersion: '2024-01-01' });

          const id = context.document?._id;
          const publishedId = id?.replace(/^drafts\./, '');

          const otherCount = await client.fetch(
            'count(*[_type == "project" && isFeatured == true && !(_id in [$id, $publishedId, "drafts." + $publishedId])])',
            { id, publishedId },
          );

          const totalAfterOperation = value ? otherCount + 1 : otherCount;

          if (totalAfterOperation > 10) {
            return `Maximum of 10 featured projects allowed. You currently have ${otherCount} others. Please unfeature one first.`;
          }

          if (totalAfterOperation < 4) {
            return {
              message: `Minimum of 4 featured projects recommended. You will have ${totalAfterOperation}.`,
              level: 'warning',
            } as any;
          }

          return true;
        }),
    }),

    // ===================================================
    // LOCATION GROUP
    // ===================================================
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'location',
      description:
        'Specific location/community name (e.g., "Olooji Community")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lga',
      title: 'LGA (Local Government Area)',
      type: 'string',
      group: 'location',
      description: 'Local Government Area (e.g., "Karu")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      group: 'location',
      description: 'The Nigerian state where the project is located',
      options: {
        list: [
          { title: 'Abia', value: 'Abia' },
          { title: 'Adamawa', value: 'Adamawa' },
          { title: 'Akwa Ibom', value: 'Akwa Ibom' },
          { title: 'Anambra', value: 'Anambra' },
          { title: 'Bauchi', value: 'Bauchi' },
          { title: 'Bayelsa', value: 'Bayelsa' },
          { title: 'Benue', value: 'Benue' },
          { title: 'Borno', value: 'Borno' },
          { title: 'Cross River', value: 'Cross River' },
          { title: 'Delta', value: 'Delta' },
          { title: 'Ebonyi', value: 'Ebonyi' },
          { title: 'Edo', value: 'Edo' },
          { title: 'Ekiti', value: 'Ekiti' },
          { title: 'Enugu', value: 'Enugu' },
          { title: 'FCT', value: 'FCT' },
          { title: 'Gombe', value: 'Gombe' },
          { title: 'Imo', value: 'Imo' },
          { title: 'Jigawa', value: 'Jigawa' },
          { title: 'Kaduna', value: 'Kaduna' },
          { title: 'Kano', value: 'Kano' },
          { title: 'Katsina', value: 'Katsina' },
          { title: 'Kebbi', value: 'Kebbi' },
          { title: 'Kogi', value: 'Kogi' },
          { title: 'Kwara', value: 'Kwara' },
          { title: 'Lagos', value: 'Lagos' },
          { title: 'Nasarawa', value: 'Nasarawa' },
          { title: 'Niger', value: 'Niger' },
          { title: 'Ogun', value: 'Ogun' },
          { title: 'Ondo', value: 'Ondo' },
          { title: 'Osun', value: 'Osun' },
          { title: 'Oyo', value: 'Oyo' },
          { title: 'Plateau', value: 'Plateau' },
          { title: 'Rivers', value: 'Rivers' },
          { title: 'Sokoto', value: 'Sokoto' },
          { title: 'Taraba', value: 'Taraba' },
          { title: 'Yobe', value: 'Yobe' },
          { title: 'Zamfara', value: 'Zamfara' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: 'location',
      description: 'Latitude for the homepage map project dot. Example: 9.0765',
      validation: Rule =>
        Rule.min(-90)
          .max(90)
          .custom((value, context) => {
            const longitude = (context.document as { longitude?: number })
              ?.longitude;

            if (
              (value === undefined || value === null) &&
              longitude !== undefined &&
              longitude !== null
            ) {
              return 'Latitude is required when longitude is set';
            }

            return true;
          }),
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: 'location',
      description:
        'Longitude for the homepage map project dot. Example: 7.3986',
      validation: Rule =>
        Rule.min(-180)
          .max(180)
          .custom((value, context) => {
            const latitude = (context.document as { latitude?: number })
              ?.latitude;

            if (
              (value === undefined || value === null) &&
              latitude !== undefined &&
              latitude !== null
            ) {
              return 'Longitude is required when latitude is set';
            }

            return true;
          }),
    }),

    // ===================================================
    // IMPACT METRICS GROUP
    // ===================================================
    defineField({
      name: 'impactMetrics',
      title: 'Impact Metrics',
      type: 'object',
      group: 'impact',
      description: 'Impact metrics and system specifications for the project',
      fields: [
        {
          name: 'kwp',
          title: 'Kilowatts Peak (kWp)',
          type: 'number',
          description: 'System capacity in kilowatts peak (e.g., 150)',
        },
        {
          name: 'systemType',
          title: 'System Type',
          type: 'string',
          description: 'Type of solar system installed',
          options: {
            list: [
              { title: 'Solar Mini-Grid', value: 'Solar Mini-Grid' },
              {
                title: 'Hybrid Solar Mini-Grid',
                value: 'Hybrid Solar Mini-Grid',
              },
              {
                title: 'Solar Home System (SHS)',
                value: 'Solar Home System (SHS)',
              },
              {
                title: 'C&I Solar Rooftop System',
                value: 'C&I Solar Rooftop System',
              },
              {
                title: 'C&I Solar Ground-Mounted System',
                value: 'C&I Solar Ground-Mounted System',
              },
              {
                title: 'Solar + Battery Backup System',
                value: 'Solar + Battery Backup System',
              },
              {
                title: 'Solar Water Pumping System',
                value: 'Solar Water Pumping System',
              },
              {
                title: 'Solar Street Lighting System',
                value: 'Solar Street Lighting System',
              },
              {
                title: 'Solar Borehole System',
                value: 'Solar Borehole System',
              },
              {
                title: 'Solar Cold Storage System',
                value: 'Solar Cold Storage System',
              },
              {
                title: 'Solar Irrigation System',
                value: 'Solar Irrigation System',
              },
              {
                title: 'Institutional Solar System',
                value: 'Institutional Solar System',
              },
            ],
          },
        },
        {
          name: 'beneficiaries',
          title: 'Beneficiaries',
          type: 'number',
          description: 'Number of people benefiting from this project',
        },
        {
          name: 'jobsCreatedDirectly',
          title: 'Jobs Created Directly',
          type: 'number',
          description:
            'Number of direct jobs. Auto-calculated to 95 for Isolated Mini-Grid projects.',
          readOnly: ({
            document,
          }: {
            document: Record<string, unknown> | null;
          }) => {
            const cats = (document?.categories as any[]) || [];
            const isMiniGrid = cats.some(c => c._ref === 'category-mini-grids');
            return isMiniGrid && document?.subcategory === 'isolated';
          },
        },
        {
          name: 'jobsCreatedIndirectly',
          title: 'Jobs Created Indirectly',
          type: 'number',
          description:
            'Number of indirect jobs. Auto-calculated as Beneficiaries/100 for Isolated Mini-Grid projects.',
          readOnly: ({
            document,
          }: {
            document: Record<string, unknown> | null;
          }) => {
            const cats = (document?.categories as any[]) || [];
            const isMiniGrid = cats.some(c => c._ref === 'category-mini-grids');
            return isMiniGrid && document?.subcategory === 'isolated';
          },
        },
        {
          name: 'annualCO2Reduction',
          title: 'Annual CO₂ Reduction (t/yr)',
          type: 'number',
          description:
            'Annual CO₂ reduction. Auto-calculated as Energy * 0.00053 for Isolated Mini-Grid projects.',
          readOnly: ({
            document,
          }: {
            document: Record<string, unknown> | null;
          }) => {
            const cats = (document?.categories as any[]) || [];
            const isMiniGrid = cats.some(c => c._ref === 'category-mini-grids');
            return isMiniGrid && document?.subcategory === 'isolated';
          },
        },
        {
          name: 'annualEnergyOutput',
          title: 'Annual Energy Output (kWh/yr)',
          type: 'number',
          description:
            'Annual energy output. Auto-calculated as kWp * 1460 for Isolated Mini-Grid projects.',
          readOnly: ({
            document,
          }: {
            document: Record<string, unknown> | null;
          }) => {
            const cats = (document?.categories as any[]) || [];
            const isMiniGrid = cats.some(c => c._ref === 'category-mini-grids');
            return isMiniGrid && document?.subcategory === 'isolated';
          },
        },
        {
          name: 'bess',
          title: 'Battery Storage Capacity (BESS) (kWh)',
          type: 'number',
          description: 'Battery storage capacity in Kilowatt-hours (e.g., 192)',
        },
        {
          name: 'dieselReduc',
          title: 'Diesel Reduction (%)',
          type: 'number',
          description: 'Percentage of diesel generator displacement (e.g., 85)',
        },
        {
          name: 'costSavings',
          title: 'Cost Savings (%)',
          type: 'number',
          description:
            'Percentage of operational energy cost savings (e.g., 50)',
        },
        {
          name: 'patientCareInc',
          title: 'Patient Care Increment (%)',
          type: 'number',
          description:
            'Percentage increase in patient care / service capacity (e.g., 40)',
        },
        {
          name: 'uptime',
          title: 'System Uptime (%)',
          type: 'number',
          description: 'Percentage of system energy uptime (e.g., 99)',
        },
      ],
    } as any),
    defineField({
      name: 'customMetrics',
      title: 'Custom Impact Metrics',
      type: 'array',
      group: 'impact',
      description: 'Add custom metrics specific to this project',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Metric Label',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Metric Value',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Icon Class (Optional)',
              type: 'string',
            }),
          ],
        },
      ],
    }),

    // ===================================================
    // CONTENT, GALLERY & SEO GROUP
    // ===================================================
    defineField({
      name: 'coverImage',
      title: 'Project Image',
      type: 'image',
      group: 'content',
      description: 'Main image for the project card and hero section',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Describe the image for accessibility',
          validation: Rule =>
            Rule.required().error(
              'Alt text is required for SEO and accessibility.',
            ),
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'descriptionTemplate',
      title: 'Description Template',
      type: 'string',
      group: 'content',
      description:
        'Choose a description template (a live preview filled with this project’s values appears below) or select Custom to write your own.',
      options: {
        list: [
          { title: 'Description Template 1', value: 'description1' },
          { title: 'Description Template 2', value: 'description2' },
          { title: 'Description Template 3', value: 'description3' },
          { title: 'Description Template 4', value: 'description4' },
          { title: 'Description Template 5', value: 'description5' },
          { title: 'Description Template 6', value: 'description6' },
          { title: 'Description Template 7', value: 'description7' },
          { title: 'Healthcare Template 1', value: 'healthcare1' },
          { title: 'Healthcare Template 2', value: 'healthcare2' },
          { title: 'Healthcare Template 3', value: 'healthcare3' },
          { title: 'Custom Description', value: 'custom' },
        ],
      },
      initialValue: 'description1',
      components: {
        input: DescriptionTemplatePreview,
      },
    }),
    defineField({
      name: 'content',
      title: 'Custom Description Content',
      type: 'blockContent',
      group: 'content',
      description:
        'Write your own custom description (only shown if "Custom Description" is selected above)',
      hidden: ({ document }) => document?.descriptionTemplate !== 'custom',
    }),
    defineField({
      name: 'gallery',
      title: 'Project Images/Videos Gallery',
      type: 'array',
      group: 'content',
      description: 'Upload multiple project images and videos for the gallery',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Describe the image for accessibility',
              validation: Rule =>
                Rule.required().error(
                  'Alt text is required for SEO and accessibility.',
                ),
            },
          ],
        },
        {
          type: 'file',
          name: 'video',
          title: 'Video',
          options: { accept: 'video/*' },
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Video Title',
              description: 'Optional title/caption for the video',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Describe the video for accessibility',
              validation: Rule =>
                Rule.required().error(
                  'Alt text is required for accessibility.',
                ),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social Settings',
      type: 'seo',
      group: 'content',
    }),

    // Comments & Backups (General)
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'array',
      group: 'general',
      of: [
        {
          type: 'object',
          name: 'comment',
          fields: [
            {
              name: 'author',
              title: 'Author',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'email',
              title: 'Email',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'commentContent',
              title: 'Comment',
              type: 'text',
              rows: 3,
              validation: (Rule: any) => Rule.required().min(10),
            },
            {
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
              readOnly: true,
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'isApproved',
              title: 'Approved',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'author',
              subtitle: 'commentContent',
              media: 'isApproved',
            },
            prepare(selection: Record<string, any>) {
              const { title, subtitle, media } = selection as {
                title: string;
                subtitle: string;
                media: boolean;
              };
              return {
                title: title,
                subtitle:
                  subtitle?.substring(0, 50) +
                  (subtitle?.length > 50 ? '...' : ''),
                media: media ? '✓' : '⏳',
              };
            },
          },
        },
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'sharepointBackup',
      title: 'SharePoint Backup',
      type: 'object',
      group: 'general',
      readOnly: true,
      fields: [
        defineField({ name: 'status', title: 'Status', type: 'string' }),
        defineField({
          name: 'lastSyncedAt',
          title: 'Last Synced At',
          type: 'datetime',
        }),
        defineField({
          name: 'folderPath',
          title: 'Folder Path',
          type: 'string',
        }),
        defineField({
          name: 'assetCount',
          title: 'Asset Count',
          type: 'number',
        }),
        defineField({
          name: 'lastError',
          title: 'Last Error',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      media: 'coverImage',
      isFeatured: 'isFeatured',
    },
    prepare({ title, date, media, isFeatured }) {
      const subtitle = [
        date ? new Date(date).toISOString().split('T')[0] : 'No date set',
        isFeatured ? '⭐ Featured' : null,
      ]
        .filter(Boolean)
        .join(' • ');

      return {
        title: title,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});
