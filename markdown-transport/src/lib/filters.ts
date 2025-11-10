import { Post } from './types.js';

/**
 * Filter published posts (not drafts, publishDate <= now)
 */
export function filterPublished(posts: Post[]): Post[] {
  const now = new Date();
  return posts.filter(post => {
    if (post.metadata.draft) return false;
    const publishDate = new Date(post.metadata.publishDate);
    return publishDate <= now;
  });
}

/**
 * Sort posts by publish date (newest first)
 */
export function sortByDate(posts: Post[], ascending = false): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.metadata.publishDate).getTime();
    const dateB = new Date(b.metadata.publishDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
