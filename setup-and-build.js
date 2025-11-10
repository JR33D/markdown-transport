#!/usr/bin/env node

/**
 * Markdown Transport System - Complete Project Initialization
 * Run this from your repository root: node init-project.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`❌ Command failed: ${command}`, colors.red);
    process.exit(1);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n');
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main setup process
async function setup() {
  log('🚀 Initializing Markdown Transport System...', colors.blue);
  console.log();

  const root = process.cwd();

  // Step 1: Create root package.json
  log('📦 Creating root package.json...', colors.blue);
  const rootPackage = {
    name: "markdown-content-system",
    version: "1.0.0",
    description: "Reusable Markdown content management system",
    private: true,
    scripts: {
      "setup": "node init-project.js",
      "build:lib": "cd markdown-transport && npm run build",
      "build": "npm run build:lib"
    },
    keywords: ["markdown", "content", "blog", "cms"],
    author: "",
    license: "MIT"
  };
  writeFile(path.join(root, 'package.json'), JSON.stringify(rootPackage, null, 2));
  log('✅ Root package.json created', colors.green);
  console.log();

  // Step 2: Create markdown-transport library
  log('📚 Creating markdown-transport library...', colors.blue);
  const libPath = path.join(root, 'markdown-transport');
  createDir(path.join(libPath, 'src'));

  // Library package.json
  const libPackage = {
    name: "markdown-transport",
    version: "0.1.0",
    description: "Reusable library for loading and parsing Markdown content",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    type: "module",
    scripts: {
      "build": "tsc",
      "build:watch": "tsc --watch",
      "clean": "rm -rf dist"
    },
    keywords: ["markdown", "frontmatter", "content"],
    author: "",
    license: "MIT",
    devDependencies: {
      "@types/node": "^20.10.0",
      "typescript": "^5.3.3"
    },
    dependencies: {
      "gray-matter": "^4.0.3"
    }
  };
  writeFile(path.join(libPath, 'package.json'), JSON.stringify(libPackage, null, 2));

  // Library tsconfig.json
  const libTsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      lib: ["ES2022"],
      outDir: "./dist",
      rootDir: "./src",
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"]
  };
  writeFile(path.join(libPath, 'tsconfig.json'), JSON.stringify(libTsConfig, null, 2));

  // Library main index.ts
  const indexTs = `
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

export class MarkdownTransport {
  private contentDir: string;

  constructor(contentDir: string) {
    this.contentDir = contentDir;
  }

  /**
   * Load all markdown files from the content directory
   */
  async loadAll(): Promise<Post[]> {
    const files = fs.readdirSync(this.contentDir)
      .filter(file => file.endsWith('.md'));

    const posts = files.map(file => {
      const filePath = path.join(this.contentDir, file);
      return this.loadFile(filePath);
    });

    return posts;
  }

  /**
   * Load a single markdown file
   */
  loadFile(filePath: string): Post {
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

  /**
   * Filter published posts (not drafts, publishDate <= now)
   */
  filterPublished(posts: Post[]): Post[] {
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
  sortByDate(posts: Post[], ascending = false): Post[] {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.metadata.publishDate).getTime();
      const dateB = new Date(b.metadata.publishDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}
`;
  writeFile(path.join(libPath, 'src', 'index.ts'), indexTs);
  log('✅ Library structure created', colors.green);
  console.log();

  // Step 3: Create example-app
  log('🎨 Creating example-app...', colors.blue);
  const appPath = path.join(root, 'example-app');
  createDir(path.join(appPath, 'src'));

  // App package.json
  const appPackage = {
    name: "example-app",
    version: "0.1.0",
    description: "Example application using markdown-transport",
    type: "module",
    scripts: {
      "start": "node --loader ts-node/esm src/index.ts",
      "dev": "node --loader ts-node/esm --watch src/index.ts"
    },
    dependencies: {
      "markdown-transport": "file:../markdown-transport"
    },
    devDependencies: {
      "@types/node": "^20.10.0",
      "ts-node": "^10.9.2",
      "typescript": "^5.3.3"
    }
  };
  writeFile(path.join(appPath, 'package.json'), JSON.stringify(appPackage, null, 2));

  // App tsconfig.json
  const appTsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      lib: ["ES2022"],
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true
    },
    "ts-node": {
      esm: true,
      experimentalSpecifierResolution: "node"
    },
    include: ["src/**/*"],
    exclude: ["node_modules"]
  };
  writeFile(path.join(appPath, 'tsconfig.json'), JSON.stringify(appTsConfig, null, 2));

  // App main index.ts
  const appIndexTs = `
import path from 'path';
import { fileURLToPath } from 'url';
import { MarkdownTransport } from 'markdown-transport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('📖 Loading posts...\\n');

  const contentDir = path.join(__dirname, '../../content');
  const transport = new MarkdownTransport(contentDir);

  // Load all posts
  const allPosts = await transport.loadAll();
  console.log(\`Found \${allPosts.length} total posts\\n\`);

  // Filter to published only
  const publishedPosts = transport.filterPublished(allPosts);
  console.log(\`\${publishedPosts.length} published posts\\n\`);

  // Sort by date
  const sortedPosts = transport.sortByDate(publishedPosts);

  // Display posts
  sortedPosts.forEach(post => {
    console.log('---');
    console.log(\`Title: \${post.metadata.title}\`);
    console.log(\`Slug: \${post.metadata.slug}\`);
    console.log(\`Published: \${post.metadata.publishDate}\`);
    console.log(\`Tags: \${post.metadata.tags?.join(', ') || 'none'}\`);
    console.log(\`Content preview: \${post.content.substring(0, 100)}...\`);
    console.log('');
  });
}

main().catch(console.error);
`;
  writeFile(path.join(appPath, 'src', 'index.ts'), appIndexTs);
  log('✅ Example app created', colors.green);
  console.log();

  // Step 4: Create content directory with sample post
  log('📝 Creating content directory...', colors.blue);
  const contentPath = path.join(root, 'content');
  createDir(contentPath);

  const samplePost = `
---
title: "Welcome to Your Markdown Transport System"
slug: "welcome"
publishDate: "2025-01-01"
draft: false
tags: ["welcome", "introduction"]
---

# Welcome!

This is a sample blog post to demonstrate your Markdown Transport System.

## Features

- **Frontmatter parsing**: Metadata extracted from YAML frontmatter
- **Scheduled publishing**: Control when posts go live
- **Draft mode**: Work on posts before publishing
- **Reusable**: Use the same content across multiple apps

Edit this file or create new \`.md\` files in the \`content/\` directory to get started!
`;
  writeFile(path.join(contentPath, 'sample-post.md'), samplePost);
  log('✅ Sample content created', colors.green);
  console.log();

  // Step 5: Create .gitignore
  log('🔒 Creating .gitignore...', colors.blue);
  const gitignore = `
node_modules/
dist/
*.log
.DS_Store
.env
.vscode/
`;
  writeFile(path.join(root, '.gitignore'), gitignore);
  log('✅ .gitignore created', colors.green);
  console.log();

  // Step 6: Install dependencies and build
  log('📦 Installing dependencies...', colors.blue);
  log('  Installing library dependencies...');
  execCommand('npm install', libPath);
  console.log();

  log('🔧 Building library...', colors.blue);
  execCommand('npm run build', libPath);
  console.log();

  log('  Installing app dependencies...');
  execCommand('npm install', appPath);
  console.log();

  // Final success message
  log('🎉 Project initialized successfully!', colors.green);
  console.log();
  log('Project structure:', colors.yellow);
  log('  markdown-transport/    - Reusable library');
  log('  example-app/          - Example consumer app');
  log('  content/              - Markdown content files');
  console.log();
  log('Next steps:', colors.yellow);
  log('  1. Add more Markdown files to ./content/');
  log('  2. Run the example app:');
  log('     cd example-app && npm run start');
  console.log();
  log('  3. For development with auto-reload:');
  log('     cd example-app && npm run dev');
  console.log();
  log('Development workflow:', colors.yellow);
  log('  • Edit library: markdown-transport/src/index.ts');
  log('  • Rebuild library: cd markdown-transport && npm run build');
  log('  • Edit app: example-app/src/index.ts');
  console.log();
}

// Run the setup
setup().catch(error => {
  log(`❌ Initialization failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});