export interface PostMetadata {
  title: string;
  slug: string;
  publishDate: string;
  draft: boolean;
  tags?: string[];
  [key: string]: any;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
  rawContent: string;
}

export interface GitAuth {
  username?: string;
  password?: string;
}

export interface TransportConfig {
  contentDir?: string;
  gitRepoUrl?: string;
  gitAuth?: GitAuth;
  gitStrategy?: 'clone' | 'pull' | 'none'; // New: 'clone' (default), 'pull', 'none'
  gitLocalPath?: string; // New: Path to local git repo
  gitAuthorName?: string; // New: Author name for Git operations
  gitAuthorEmail?: string; // New: Author email for Git operations
}
