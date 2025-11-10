import path from 'path';
import { fileURLToPath } from 'url';
import { MarkdownTransport, TransportConfig, GitAuth } from 'markdown-transport';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('📖 Loading posts...\n');

  const gitRepoUrl = process.env.CONTENT_GIT_REPO_URL;
  const gitUsername = process.env.GIT_USERNAME;
  const gitPassword = process.env.GIT_PASSWORD;
  const gitStrategy = process.env.GIT_STRATEGY as TransportConfig['gitStrategy'];
  const gitLocalPath = process.env.GIT_LOCAL_PATH;
  const gitAuthorName = process.env.GIT_AUTHOR_NAME;
  const gitAuthorEmail = process.env.GIT_AUTHOR_EMAIL;

  const gitAuth: GitAuth | undefined = gitUsername ? { username: gitUsername, password: gitPassword } : undefined;

  const config: TransportConfig = gitRepoUrl
    ? { gitRepoUrl, gitAuth, gitStrategy, gitLocalPath, gitAuthorName, gitAuthorEmail }
    : { contentDir: path.join(__dirname, '../../content') };

  const transport = new MarkdownTransport(config);

  // If a Git repository is configured and a local path is provided,
  // we can explicitly sync it.
  if (gitRepoUrl && gitLocalPath) {
    console.log('Syncing Git repository...');
    await transport.sync();
    console.log('Git repository synced.\n');
  }

  // Load all posts
  const allPosts = await transport.loadAll();
  console.log(`Found ${allPosts.length} total posts\n`);

  // Filter to published only
  const publishedPosts = transport.filterPublished(allPosts);
  console.log(`${publishedPosts.length} published posts\n`);

  // Sort by date
  const sortedPosts = transport.sortByDate(publishedPosts);

  // Display posts
  sortedPosts.forEach(post => {
    console.log('---');
    console.log(`Title: ${post.metadata.title}`);
    console.log(`Slug: ${post.metadata.slug}`);
    console.log(`Published: ${post.metadata.publishDate}`);
    console.log(`Tags: ${post.metadata.tags?.join(', ') || 'none'}`);
    console.log(`Content preview: ${post.content.substring(0, 100)}...`);
    console.log('');
  });
}

main().catch(console.error);
