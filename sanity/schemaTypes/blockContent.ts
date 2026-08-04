import { defineArrayMember, defineType } from 'sanity';

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
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
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: Rule =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describe the image for accessibility and SEO',
          validation: Rule =>
            Rule.required().error(
              'Alt text is required for SEO and accessibility.',
            ),
        },
      ],
    }),
    defineArrayMember({
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
          title: 'Alternative Text',
          description: 'Describe the video for accessibility',
          validation: Rule =>
            Rule.required().error('Alt text is required for accessibility.'),
        },
      ],
    }),
  ],
});
