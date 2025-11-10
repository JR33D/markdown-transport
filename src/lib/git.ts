import fs from 'fs';
import path from 'path';
import os from 'os';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { TransportConfig } from './types.js';

export async function cloneOrPullRepository(config: TransportConfig): Promise<string> {
  if (!config.gitRepoUrl) {
    throw new Error('Git repository URL is not specified.');
  }

  const localPath = config.gitLocalPath || fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-transport-'));
  const dir = path.resolve(localPath);
  console.log(`Using local path for Git operations: ${dir}`);
  const isRepoCloned = fs.existsSync(path.join(dir, '.git'));
  console.log(`Repository already cloned: ${isRepoCloned}`);

  const author = {
    name: config.gitAuthorName || 'Markdown Transport',
    email: config.gitAuthorEmail || 'markdown-transport@example.com',
  };

  // Set author and committer globally for the current git instance
  await git.setConfig({ fs, dir, path: 'user.name', value: author.name });
  await git.setConfig({ fs, dir, path: 'user.email', value: author.email });

  if (config.gitStrategy === 'none') {
    console.log(`Git strategy is 'none'. Skipping Git operations for ${dir}.`);
  } else if (config.gitStrategy === 'pull') {
    if (isRepoCloned) {
      console.log(`Pulling updates for ${config.gitRepoUrl} into ${dir}...`);
      await git.pull({
        fs,
        http,
        dir,
        url: config.gitRepoUrl,
        singleBranch: true,
        fastForward: true,
        onAuth: () => config.gitAuth,
        onAuthFailure: () => {
          console.error('Git authentication failed during pull.');
        },
      });
    } else {
      console.log(`Repository not found at ${dir}. Cloning ${config.gitRepoUrl} instead of pulling.`);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
      fs.mkdirSync(dir, { recursive: true });
      await git.clone({
        fs,
        http,
        dir,
        url: config.gitRepoUrl,
        singleBranch: true,
        depth: 1,
        onAuth: () => config.gitAuth,
        onAuthFailure: () => {
          console.error('Git authentication failed during clone.');
        },
      });
    }
  } else { // Default to 'clone' strategy
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Cloning ${config.gitRepoUrl} into ${dir}...`);
    await git.clone({
      fs,
      http,
      dir,
      url: config.gitRepoUrl,
      singleBranch: true,
      depth: 1,
      onAuth: () => config.gitAuth,
      onAuthFailure: () => {
        console.error('Git authentication failed during clone.');
      },
    });
  }

  return dir;
}

export async function pullRepository(config: TransportConfig): Promise<string> {
  if (!config.gitRepoUrl) {
    throw new Error('Git repository URL is not specified.');
  }
  if (!config.gitLocalPath) {
    throw new Error('Git local path is not specified for pull operation.');
  }

  const dir = path.resolve(config.gitLocalPath);
  const author = {
    name: config.gitAuthorName || 'Markdown Transport',
    email: config.gitAuthorEmail || 'markdown-transport@example.com',
  };

  // Set author and committer globally for the current git instance
  await git.setConfig({ fs, dir, path: 'user.name', value: author.name });
  await git.setConfig({ fs, dir, path: 'user.email', value: author.email });

  if (!fs.existsSync(path.join(dir, '.git'))) {
    // If pull is explicitly called and repo not found, we should clone
    console.log(`Repository not found at ${dir}. Cloning ${config.gitRepoUrl} instead of pulling.`);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
    await git.clone({
      fs,
      http,
      dir,
      url: config.gitRepoUrl,
      singleBranch: true,
      depth: 1,
      onAuth: () => config.gitAuth,
      onAuthFailure: () => {
        console.error('Git authentication failed during clone.');
      },
    });
  } else {
    console.log(`Pulling updates for ${config.gitRepoUrl} into ${dir}...`);
    await git.pull({
      fs,
      http,
      dir,
      url: config.gitRepoUrl,
      singleBranch: true,
      fastForward: true,
      onAuth: () => config.gitAuth,
      onAuthFailure: () => {
        console.error('Git authentication failed during pull.');
      },
    });
  }

  return dir;
}
