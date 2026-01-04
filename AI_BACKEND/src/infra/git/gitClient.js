
// import simpleGit from 'simple-git';
// import fs from 'fs';
// import path from 'path';
// import { WORKSPACE_ROOT } from '../../config/env.js';

// export async function ensureWorkspaceAndPull({ repoUrl, branch='main', workspaceName }) {
//   await fs.promises.mkdir(WORKSPACE_ROOT, { recursive: true });
//   const appDir = path.join(WORKSPACE_ROOT, workspaceName);
//   const repoDir = path.join(appDir, 'repo');
//   const git = simpleGit();

//   let prev = null, cur = null;
//   if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

//   if (!fs.existsSync(repoDir)) {
//     await git.clone(repoUrl, repoDir, ['-b', branch, '--single-branch']);
//     const rg = simpleGit(repoDir);
//     cur = (await rg.revparse(['HEAD'])).trim();
//   } else {
//     const rg = simpleGit(repoDir);
//     try { prev = (await rg.revparse(['HEAD'])).trim(); } catch {}
//     await rg.fetch();
//     await rg.checkout(branch);
//     await rg.pull('origin', branch);
//     cur = (await rg.revparse(['HEAD'])).trim();
//   }
//   // write meta
//   await fs.promises.writeFile(path.join(appDir, '.ai-e2e-meta.json'), JSON.stringify({ lastCommit: cur }, null, 2));
//   return { repoPath: repoDir, prevCommit: prev, newCommit: cur, workspaceDir: appDir };
// }

// export async function getDiffFiles(repoPath, from, to) {
//   if (!from || !to) return [];
//   const rg = simpleGit(repoPath);
//   try {
//     const diff = await rg.diff([`${from}..${to}`, '--name-only']);
//     return diff.split(/\r?\n/).filter(Boolean);
//   } catch (e) {
//     return [];
//   }
// }

// import simpleGit from 'simple-git';
// import fs from 'fs';
// import path from 'path';
// import { WORKSPACE_ROOT } from '../../config/env.js';

// export async function ensureWorkspaceAndPull({ repoUrl, branch = 'main', workspaceName }) {
//   await fs.promises.mkdir(WORKSPACE_ROOT, { recursive: true });

//   const appDir = path.join(WORKSPACE_ROOT, workspaceName);
//   const repoDir = path.join(appDir, 'repo');

//   // Always create appDir
//   await fs.promises.mkdir(appDir, { recursive: true });

//   // IMPORTANT — Git instance MUST point to parent folder where cloning happens
//   const git = simpleGit(appDir);

//   let prev = null;
//   let cur = null;

//   if (!fs.existsSync(repoDir)) {
//     // --- FIRST TIME CLONE ---
//     console.log("Cloning fresh repo into:", repoDir);

//     await git.clone(repoUrl, 'repo', [
//       '-b', branch,
//       '--single-branch'
//     ]);

//     const repoGit = simpleGit(repoDir);
//     cur = (await repoGit.revparse(['HEAD'])).trim();
//   } else {
//     // --- UPDATE EXISTING REPO ---
//     const repoGit = simpleGit(repoDir);

//     try {
//       prev = (await repoGit.revparse(['HEAD'])).trim();
//     } catch {}

//     console.log("Fetching updates...");
//     await repoGit.fetch();

//     console.log(`Checking out branch: ${branch}`);
//     await repoGit.checkout(branch);

//     console.log("Pulling latest changes...");
//     await repoGit.pull('origin', branch);

//     cur = (await repoGit.revparse(['HEAD'])).trim();
//   }

//   // Save meta
//   const meta = {
//     lastCommit: cur,
//     repoUrl,
//     branch
//   };

//   await fs.promises.writeFile(
//     path.join(appDir, '.ai-e2e-meta.json'),
//     JSON.stringify(meta, null, 2)
//   );

//   return {
//     repoPath: repoDir,
//     prevCommit: prev,
//     newCommit: cur,
//     workspaceDir: appDir
//   };
// }

import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { WORKSPACE_ROOT } from '../../config/env.js';

export async function ensureWorkspaceAndPull({ repoUrl, branch = 'main', workspaceName }) {
  await fs.promises.mkdir(WORKSPACE_ROOT, { recursive: true });

  const appDir = path.join(WORKSPACE_ROOT, workspaceName);
  const repoDir = path.join(appDir, 'repo');

  await fs.promises.mkdir(appDir, { recursive: true });

  const git = simpleGit(appDir);
  let prev = null;
  let cur = null;

  console.log("repoDir",repoDir);
  
  // ============================
  // FIRST-TIME CLONE
  // ============================
  if (!fs.existsSync(repoDir)) {
    console.log("🆕 Cloning fresh repo into:", repoDir);

    // FIX 👉 Removed --single-branch to allow switching later
    await git.clone(repoUrl, 'repo', ['--branch', branch]);

    const repoGit = simpleGit(repoDir);
    cur = (await repoGit.revparse(['HEAD'])).trim();
  } else {
    // ============================
    // UPDATE EXISTING CLONE
    // ============================
    const repoGit = simpleGit(repoDir);

    try {
      prev = (await repoGit.revparse(['HEAD'])).trim();
    } catch {}

    console.log("📡 Fetching all remote branches...");
    
    // 🔥 Full branch refresh: ensures all GitHub branches are visible
    await repoGit.fetch(['--all', '--prune', '--depth=1']);
    await repoGit.raw(['remote', 'set-branches', 'origin', '*']);
    await repoGit.fetch(['--all', '--prune']);

    // 🔍 Log available branches
    const branches = await repoGit.branch(['-a']);
    console.log("🔍 Available branches after fetch:", branches.all);

    const remoteBranch = `origin/${branch}`;
    const isRemote = branches.all.includes(remoteBranch) ||
                     branches.all.includes(`remotes/origin/${branch}`);

    const isLocal = branches.all.includes(branch);

    // ============================
    // BRANCH CHECKOUT LOGIC
    // ============================
    if (isRemote) {
      console.log(`🌿 Checking out remote branch: ${remoteBranch}`);
      await repoGit.checkout(['-B', branch, remoteBranch]);
    } else if (isLocal) {
      console.log(`🌿 Switching to existing local branch: ${branch}`);
      await repoGit.checkout(branch);
    } else {
      throw new Error(
        `❌ Branch "${branch}" not found locally or on remote origin.\n` +
        `Available branches: ${branches.all.join(', ')}`
      );
    }

    console.log("⬇ Pulling latest changes...");
    await repoGit.pull('origin', branch);

    cur = (await repoGit.revparse(['HEAD'])).trim();
  }

  // ============================
  // SAVE METADATA
  // ============================
  const meta = {
    lastCommit: cur,
    repoUrl,
    branch
  };

  await fs.promises.writeFile(
    path.join(appDir, '.ai-e2e-meta.json'),
    JSON.stringify(meta, null, 2)
  );

  return {
    repoPath: repoDir,
    prevCommit: prev,
    newCommit: cur,
    workspaceDir: appDir
  };
}



// export async function getDiffFiles(repoPath, from, to) {
//   if (!from || !to) return [];

//   const repoGit = simpleGit(repoPath);

//   try {
//     const diff = await repoGit.diff([`${from}..${to}`, '--name-only']);
//     return diff.split(/\r?\n/).filter(Boolean);
//   } catch (err) {
//     console.error("Diff error:", err);
//     return [];
//   }
// }




export async function getDiffFiles(repoPath, from, to) {
  if (!from || !to) return [];

  const repoGit = simpleGit(repoPath);

  try {
    // 1️⃣ Get list of changed files
    const diffNames = await repoGit.diff([`${from}..${to}`, '--name-only']);
    const files = diffNames.split(/\r?\n/).filter(Boolean);
    
    // 2️⃣ Get snippet for each file (only changes, not entire file)
    const results = [];
    for (const file of files) {
      const snippet = await repoGit.diff([from, to, '--', file]);
      results.push({ path: file, snippet: snippet || '' });
    }

    return results;
  } catch (err) {
    console.error("Diff error:", err);
    return [];
  }
}

