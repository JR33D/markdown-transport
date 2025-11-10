import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';
import { Post, PostMetadata } from './types.js';

export function parseMarkdownFile(filePath: string): Post {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(rawContent);

  return {
    metadata: {
      title: data.title || 'Untitled',
      slug: data.slug || path.basename(filePath, '.md'),
      publishDate: data.publishDate || new Date().toISOString(),
      draft: data.draft ?? true,
      tags: data.tags || [],
      ...data
    },
    content,
    rawContent
  };
}
