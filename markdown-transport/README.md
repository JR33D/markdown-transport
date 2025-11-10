# markdown-transport

`markdown-transport` is a TypeScript library designed to provide a flexible and robust "transport layer" for Markdown content. It allows applications to seamlessly read, parse, and manage Markdown files from various sources, including the local filesystem and remote Git repositories.

## Features

-   **Content Loading:** Read Markdown files from a specified local directory or clone/pull from a remote Git repository.
-   **Frontmatter Parsing:** Automatically parses YAML frontmatter from Markdown files, extracting metadata such as title, slug, publish date, draft status, and tags.
-   **Content Filtering:** Provides utility functions to filter posts based on criteria like draft status and publish date.
-   **Content Sorting:** Offers utility functions to sort posts by publish date.
-   **Git Integration:**
    *   Configurable strategies (`clone`, `pull`, `none`) for managing content from Git repositories.
    *   Support for private repositories using username/password or personal access tokens (PATs).
    *   Dedicated `sync()` method for on-demand updates from remote Git repositories.
-   **TypeScript Support:** Fully typed with TypeScript interfaces for consistent data structures.
-   **Framework-Agnostic:** Designed to be easily integrated into any JavaScript/TypeScript project, regardless of the framework (e.g., Next.js, Astro, Node.js applications).

## Installation

To install the library, navigate to the `markdown-transport` directory and run:

```bash
npm install
```

## Usage

### Basic Usage (Local Filesystem)

```typescript
import { MarkdownTransport, TransportConfig } from 'markdown-transport';
import path from 'path';

async function loadLocalContent() {
  const config: TransportConfig = {
    contentDir: path.join(__dirname, './my-markdown-files')
  };
  const transport = new MarkdownTransport(config);
  const posts = await transport.loadAll();
  console.log(posts);
}

loadLocalContent();
```

### Usage with Git Repository

You can configure `markdown-transport` to fetch content directly from a Git repository.

```typescript
import { MarkdownTransport, TransportConfig, GitAuth } from 'markdown-transport';

async function loadGitContent() {
  const config: TransportConfig = {
    gitRepoUrl: 'https://github.com/your-org/your-content-repo.git',
    gitStrategy: 'pull', // 'clone', 'pull' (clones if not present, pulls otherwise), or 'none'
    gitLocalPath: './cloned-content', // Optional: persistent local path
    gitAuth: { // Optional: for private repos
      username: process.env.GIT_USERNAME,
      password: process.env.GIT_PASSWORD // Can be PAT
    },
    gitAuthorName: process.env.GIT_AUTHOR_NAME, // Optional: for merges during pull
    gitAuthorEmail: process.env.GIT_AUTHOR_EMAIL // Optional: for merges during pull
  };
  const transport = new MarkdownTransport(config);
  const posts = await transport.loadAll();
  console.log(posts);
}

loadGitContent();
```

### Syncing Content

If you've configured a `gitLocalPath` and `gitRepoUrl`, you can explicitly pull updates from the remote repository using the `sync()` method:

```typescript
import { MarkdownTransport, TransportConfig, GitAuth } from 'markdown-transport';

async function syncContent() {
  const config: TransportConfig = {
    gitRepoUrl: 'https://github.com/your-org/your-content-repo.git',
    gitLocalPath: './cloned-content',
    gitAuth: {
      username: process.env.GIT_USERNAME,
      password: process.env.GIT_PASSWORD
    },
    gitAuthorName: process.env.GIT_AUTHOR_NAME,
    gitAuthorEmail: process.env.GIT_AUTHOR_EMAIL
  };
  const transport = new MarkdownTransport(config);

  // Initial load (will clone if not present, or do nothing if strategy is 'none')
  await transport.loadAll();

  // Later, to get updates:
  await transport.sync();
  console.log('Content synced successfully!');

  // Load content again to get the updated files
  const updatedPosts = await transport.loadAll();
  console.log(updatedPosts);
}

syncContent();
```

## Configuration (`TransportConfig`)

The `MarkdownTransport` constructor accepts a `TransportConfig` object with the following properties:

-   `contentDir?: string`: The path to the local directory containing Markdown files. Used when `gitRepoUrl` is not provided.
-   `gitRepoUrl?: string`: The URL of the remote Git repository to fetch content from.
-   `gitAuth?: GitAuth`: An optional object containing `username` and `password` (or PAT) for private Git repositories.
-   `gitStrategy?: 'clone' | 'pull' | 'none'`:
    *   `'clone'` (default): Always performs a fresh clone of the repository into `gitLocalPath` (or a temporary directory).
    *   `'pull'`: If the repository exists at `gitLocalPath`, it will pull the latest changes. If not, it will clone it.
    *   `'none'`: Skips all Git operations. Content will be loaded from `gitLocalPath` or `contentDir`.
-   `gitLocalPath?: string`: The path to a local directory where the Git repository should be cloned or pulled. If not provided, a temporary directory will be used for cloning.
-   `gitAuthorName?: string`: The name to use for Git authoring (e.g., for merges during pull). Defaults to 'Markdown Transport'.
-   `gitAuthorEmail?: string`: The email to use for Git authoring. Defaults to 'markdown-transport@example.com'.

## Interfaces

The library exports the following TypeScript interfaces:

-   `PostMetadata`: Describes the structure of the frontmatter data.
-   `Post`: Represents a parsed Markdown post, including its metadata and content.
-   `GitAuth`: Describes the structure for Git authentication credentials.
-   `TransportConfig`: Describes the configuration object for the `MarkdownTransport` class.
