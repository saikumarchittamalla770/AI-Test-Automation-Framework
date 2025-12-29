
import path from 'path';
import { listFilesRecursive, readFileSafe } from '../../infra/files/fsUtils.js';

export async function collectTopFiles(repoPath, limit = 50) {

  const srcAppPath = path.join(repoPath, 'app');

  // get all files inside src/app
  const all = listFilesRecursive(srcAppPath, ['node_modules', '.next', 'dist']);

  // strict Angular filter:
  const priority = all.filter(f => {
    const isTSorHTML = f.endsWith('.ts') || f.endsWith('.html');

    const isRoutesFile =
      f.endsWith(path.join('app.routes.ts'));

    const isLoginFolder =
      f.includes(path.join('components', 'login'));

    return isTSorHTML && (isRoutesFile || isLoginFolder);
  }).slice(0, limit);

  const files = priority.length ? priority : [];

  const entries = [];

  for (const f of files) {
    const rel = path.relative(repoPath, f);
    const content = await readFileSafe(f);

    entries.push({
      path: rel,
      size: content.length,
      snippet: content.slice(0, 2000)
    });
  }

  return entries;
}
 