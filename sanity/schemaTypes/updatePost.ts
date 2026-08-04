import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { UPDATE_CATEGORY_OPTIONS } from '../constants/taxonomy';

export const updatePostType = defineType({
  name: 'updatePost',
  title: 'Update',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'general', title: '📋 General Info' },
    { name: 'content', title: '📝 Content & SEO' },
  ],
  fields: [
    // ===================================================
    // GENERAL GROUP
    // ===================================================
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'general',
      validation: Rule => Rule.required(),
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
      validation: Rule => Rule.required().max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'general',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'general',
      to: [{ type: 'author' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'general',
      of: [{ type: 'string' }],
      options: {
        list: [...UPDATE_CATEGORY_OPTIONS],
        layout: 'list',
      },
      description:
        'To add a new category, update sanity/constants/taxonomy.ts in code.',
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'general',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Free-form tags. Press Enter to add each tag.',
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

    // ===================================================
    // CONTENT, COVER IMAGE & SEO GROUP
    // ===================================================
    defineField({
      name: 'coverImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: Rule =>
            Rule.required().error(
              'Alt text is required for SEO and accessibility.',
            ),
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social Settings',
      type: 'seo',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      authorName: 'author.name',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, authorName, media } = selection;
      return {
        title: title,
        subtitle: authorName ? `by ${authorName}` : 'No author',
        media: media,
      };
    },
  },
});
