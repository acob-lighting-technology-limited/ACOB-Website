import { updatePostType } from './updatePost';
import comment from './comment';
import { projectType } from './project';
import jobPosting from './jobPosting';
import { productType } from './product';
import { authorType } from './author';
import { categoryType } from './category';
import { tagType } from './tag';
import { seoType } from './seo';
import { blockContentType } from './blockContent';

export const schemaTypes = [
  updatePostType,
  comment,
  projectType,
  jobPosting,
  productType,
  authorType,
  categoryType,
  tagType,
  seoType,
  blockContentType,
];
