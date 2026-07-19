import { defineField, defineType } from 'sanity';

export const seoType = defineType({
  name: 'seo',
  title: 'SEO Metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Title for search engines (recommended: under 60 chars)',
      validation: Rule =>
        Rule.max(60).warning(
          'Titles over 60 characters may be truncated by search engines.',
        ),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description:
        'Description for search engines (recommended: under 160 chars)',
      validation: Rule =>
        Rule.max(160).warning(
          'Descriptions over 160 characters may be truncated.',
        ),
    }),
    defineField({
      name: 'shareImage',
      title: 'Share Image',
      type: 'image',
      description:
        'Image displayed when link is shared on social media (recommended: 1200x630px)',
    }),
  ],
});
