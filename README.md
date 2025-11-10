# Markdown Transport Layer

This project is a reusable Markdown reading layer / "transport layer" that can be plugged into any project, whether the content comes from another repo, local filesystem, or remote storage. It abstracts reading, parsing frontmatter, filtering drafts/scheduled posts, and optionally mapping components.

## Features

- Read Markdown files from local FS or a remote Git repository.
- Parse frontmatter (YAML / TOML) and Markdown content.
- Support metadata fields: title, slug, summary, publishDate, tags, draft.
- Support scheduling & draft filtering.
- TypeScript interfaces for consistency.
- Optional: support custom blocks/components in Markdown (MDX or similar).
- Framework-agnostic: can plug into Next.js, Astro, or other SSGs.
- **New:** Git integration with configurable strategies (`clone`, `pull`, `none`).
- **New:** Support for private Git repositories using username/password or personal access tokens (PATs).
- **New:** Dedicated `sync()` method to pull latest changes from a remote Git repository.

## Folder Structure

```
/src
  index.ts             # Main entry point, orchestrates lib modules
  lib/                 # Core library modules
    types.ts           # TypeScript interfaces
    parser.ts          # Frontmatter + Markdown parser
    filters.ts         # Date filtering, sorting logic
    git.ts             # Git cloning and pulling logic
package.json
tsconfig.json
README.md
.gitignore
```

## Usage Example

Here's how you can use the `markdown-transport` library in your project:

```typescript
import { MarkdownTransport, TransportConfig, GitAuth } from 'markdown-transport';
import path from 'path';

async function loadContent() {
  // Example: Loading from a local content directory
  const localConfig: TransportConfig = {
    contentDir: path.join(__dirname, './content')
  };
  const localTransport = new MarkdownTransport(localConfig);
  const localPosts = await localTransport.loadAll();
  console.log('Local Posts:', localPosts);

  // Example: Loading from a public Git repository (clones into a temporary directory)
  const gitConfigPublic: TransportConfig = {
    gitRepoUrl: 'https://github.com/isomorphic-git/isomorphic-git.git',
    gitStrategy: 'clone' // Default, but explicit for clarity
  };
  const gitTransportPublic = new MarkdownTransport(gitConfigPublic);
  const gitPostsPublic = await gitTransportPublic.loadAll();
  console.log('Git Public Posts:', gitPostsPublic);

  // Example: Loading from a private Git repository (clones into a specified local path)
  // Requires GIT_USERNAME and GIT_PASSWORD (or PAT) to be set in your environment or .env file
  const gitConfigPrivate: TransportConfig = {
    gitRepoUrl: 'https://github.com/user/private-repo.git',
    gitStrategy: 'pull', // Pulls if exists, clones if not
    gitLocalPath: './my-cloned-content', // Persistent local directory
    gitAuth: {
      username: process.env.GIT_USERNAME,
      password: process.env.GIT_PASSWORD
    }
  };
  const gitTransportPrivate = new MarkdownTransport(gitConfigPrivate);
  const gitPostsPrivate = await gitTransportPrivate.loadAll();
  console.log('Git Private Posts:', gitPostsPrivate);

  // Example: Syncing an already cloned private repository
  if (gitConfigPrivate.gitRepoUrl && gitConfigPrivate.gitLocalPath) {
    console.log('Syncing private repository...');
    await gitTransportPrivate.sync();
    console.log('Private repository synced.');
  }
}

loadContent().catch(console.error);
```

### Environment Variables (`.env`)

For convenience and security, especially with private repositories, you can use a `.env` file to manage your configuration. The `example-app` demonstrates this.

Create a `.env` file in your project root (or `example-app` directory) with the following:

```
# The Git repository URL to clone content from.
# Example: CONTENT_GIT_REPO_URL=https://github.com/isomorphic-git/isomorphic-git.git
CONTENT_GIT_REPO_URL=

# Optional: Git credentials for private repositories.
# The password can also be a personal access token (PAT).
GIT_USERNAME=
GIT_PASSWORD=

# Optional: Git strategy for content loading.
# Can be 'clone' (default), 'pull' (clones if not present, pulls otherwise), or 'none'.
GIT_STRATEGY=clone

# Optional: Local path to store the cloned Git repository.
# If not provided, a temporary directory will be used for 'clone' strategy.
GIT_LOCAL_PATH=./content-repo

# Optional: Author information for Git operations (e.g., for merges during pull).
GIT_AUTHOR_NAME="Your Name"
GIT_AUTHOR_EMAIL="your.email@example.com"
```

## Extensibility

- Read Markdown from remote URLs or other repos
- Support MDX or Astro Islands for interactive components
- Integrate AI-generated Markdown directly
- Reusable across multiple projects