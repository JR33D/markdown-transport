import fs from 'fs';
import path from 'path';
import { Post, TransportConfig, GitAuth } from './lib/types.js';
import { parseMarkdownFile } from './lib/parser.js';
import { filterPublished, sortByDate } from './lib/filters.js';
import { cloneOrPullRepository } from './lib/git.js';

export * from './lib/types.js';
export * from './lib/parser.js';
export * from './lib/filters.js';
export * from './lib/git.js'; // Export git functions for advanced usage if needed

export { GitAuth, TransportConfig }; // Explicitly re-export GitAuth and TransportConfig

export class MarkdownTransport {
  private config: TransportConfig;
  private contentDir: string;

  constructor(config: TransportConfig) {
    this.config = config;
    this.contentDir = this.config.contentDir || '';
  }

  /**
   * Recursively get all markdown files from a directory
   */
  private _getMarkdownFilesRecursive(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}. Skipping recursive file search.`);
      return fileList;
    }

    let files: string[];
    try {
      files = fs.readdirSync(dir);
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
      return fileList;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(filePath);
      } catch (error) {
        console.error(`Error getting stats for file ${filePath}:`, error);
        return;
      }

      if (stat.isDirectory()) {
        this._getMarkdownFilesRecursive(filePath, fileList);
      } else if (file.endsWith('.md')) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  /**
   * Load all markdown files from the content directory
   */
  async loadAll(): Promise<Post[]> {
    if (this.config.gitRepoUrl) {
      this.contentDir = await cloneOrPullRepository(this.config);
    }

    if (!this.contentDir) {
      throw new Error('Content directory is not specified.');
    }

    const markdownFilePaths = this._getMarkdownFilesRecursive(this.contentDir);

    const posts = markdownFilePaths.map(filePath => {
      return parseMarkdownFile(filePath);
    });

    return posts;
  }

  /**
   * Load a single markdown file
   */
  loadFile(filePath: string): Post {
    return parseMarkdownFile(filePath);
  }

  /**
   * Filter published posts (not drafts, publishDate <= now)
   */
  filterPublished(posts: Post[]): Post[] {
    return filterPublished(posts);
  }

  /**
   * Sort posts by publish date (newest first)
   */
  sortByDate(posts: Post[], ascending = false): Post[] {
    return sortByDate(posts, ascending);
  }

  /**
   * Syncs the local Git repository with the remote.
   * This method should be called explicitly to update content.
   */
  async sync(): Promise<void> {
    if (!this.config.gitRepoUrl || !this.config.gitLocalPath) {
      throw new Error('Git repository URL and local path must be specified in config to sync.');
    }
    await cloneOrPullRepository(this.config);
    this.contentDir = this.config.gitLocalPath; // Ensure contentDir is updated after sync
  }
}
