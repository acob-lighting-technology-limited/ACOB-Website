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

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: PackageIcon,
  orderings: [
    orderRankOrdering,
    {
      title: 'Project Date, New',
      name: 'projectDateDesc',
      by: [{ field: 'projectDate', direction: 'desc' }],
    },
    {
      title: 'Project Date, Old',
      name: 'projectDateAsc',
      by: [{ field: 'projectDate', direction: 'asc' }],
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
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      description:
        'A short summary of the project (click "Generate" to auto-generate from project details. Recommended: 150-200 characters)',
      validation: Rule =>
        Rule.max(200).warning('Excerpt should be under 200 characters'),
      components: {
        input: ExcerptFieldWithGenerate,
      },
    }),
    defineField({
      name: 'category',
      title: 'Project Category',
      type: 'string',
      options: {
        list: [
          { title: 'Rural Electrification', value: 'rural-electrification' },
          {
            title: 'Commercial Installations',
            value: 'commercial-installations',
          },
          { title: 'Street Lighting', value: 'street-lighting' },
          { title: 'Healthcare Projects', value: 'healthcare-projects' },
        ],
      },
      initialValue: 'rural-electrification',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'projectDate',
      title: 'Project Date',
      type: 'date',
      description: 'The date when the project was completed or launched',
      options: {
        dateFormat: 'MMMM DD, YYYY',
      },
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'content',
      title: 'Content (Legacy - Will be deprecated)',
      type: 'array',
      description:
        '⚠️ Old content field. Please use "Project Content" below for new projects.',
      of: [
        {
          title: 'Block',
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: Rule =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'projectImage',
      title: 'Project Image',
      type: 'image',
      description: 'Main image for the project card and hero section',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Describe the image for accessibility',
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description:
        'Specific location/community name (e.g., "Olooji Community")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lga',
      title: 'LGA (Local Government Area)',
      type: 'string',
      description: 'Local Government Area (e.g., "Karu")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
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
    defineField({
      name: 'isFeatured',
      title: 'Featured Project',
      type: 'boolean',
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
    // Impact Metrics Fields
    defineField({
      name: 'impactMetrics',
      title: 'Impact Metrics',
      type: 'object',
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
          description: 'Number of direct jobs created by this project',
        },
        {
          name: 'jobsCreatedIndirectly',
          title: 'Jobs Created Indirectly',
          type: 'number',
          description: 'Number of indirect jobs created by this project',
        },
        {
          name: 'annualCO2Reduction',
          title: 'Annual CO₂ Reduction (t/yr)',
          type: 'number',
          description: 'Annual CO₂ reduction in tonnes per year',
        },
        {
          name: 'annualEnergyOutput',
          title: 'Annual Energy Output (kWh/yr)',
          type: 'number',
          description: 'Annual energy output in kilowatt-hours per year',
        },
      ],
    } as any),
    // New Project Content Structure
    defineField({
      name: 'projectContent',
      title: 'Project Content',
      type: 'object',
      description: 'New content structure with templates and images',
      fields: [
        {
          name: 'description',
          title: 'Description Template',
          type: 'string',
          description:
            'Choose a description template (a live preview filled with this ' +
            'project’s values appears below) or select Custom to write your own.',
          options: {
            list: [
              { title: 'Description Template 1', value: 'description1' },
              { title: 'Description Template 2', value: 'description2' },
              { title: 'Description Template 3', value: 'description3' },
              { title: 'Description Template 4', value: 'description4' },
              { title: 'Description Template 5', value: 'description5' },
              { title: 'Description Template 6', value: 'description6' },
              { title: 'Description Template 7', value: 'description7' },
              { title: 'Custom Description', value: 'custom' },
            ],
          },
          initialValue: 'description1',
          components: {
            input: DescriptionTemplatePreview,
          },
        },
        {
          name: 'customDescription',
          title: 'Custom Description',
          type: 'array',
          description:
            'Write your own custom description (only shown if "Custom Description" is selected above)',
          hidden: ({ parent }: { parent?: { description?: string } }) =>
            parent?.description !== 'custom',
          of: [
            {
              title: 'Block',
              type: 'block',
              marks: {
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      {
                        name: 'href',
                        type: 'url',
                        title: 'URL',
                        validation: Rule =>
                          Rule.uri({
                            scheme: ['http', 'https', 'mailto', 'tel'],
                          }),
                      },
                    ],
                  },
                ],
              },
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'Quote', value: 'blockquote' },
              ],
              lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Numbered', value: 'number' },
              ],
            },
          ],
        },
        {
          name: 'images',
          title: 'Project Images/Videos',
          type: 'array',
          description:
            'Upload multiple project images and videos for the gallery',
          of: [
            {
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                  description: 'Describe the image for accessibility',
                },
              ],
            },
            {
              type: 'file',
              name: 'video',
              title: 'Video',
              options: {
                accept: 'video/*',
              },
              fields: [
                {
                  name: 'title',
                  type: 'string',
                  title: 'Video Title',
                  description: 'Optional title for the video',
                },
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                  description: 'Describe the video for accessibility',
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'array',
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
      readOnly: true,
      fields: [
        defineField({
          name: 'status',
          title: 'Status',
          type: 'string',
        }),
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
      date: 'projectDate',
      media: 'projectImage',
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
