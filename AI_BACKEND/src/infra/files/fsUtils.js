
import fs from 'fs';
import path from 'path';

export async function readFileSafe(p) {
  try { return await fs.promises.readFile(p, 'utf8'); } catch { return ''; }
}

export function listFilesRecursive(dir, ignorePatterns=[]) {
  const out = [];
  function walk(d) {
    const items = fs.readdirSync(d, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(d, it.name);
      if (ignorePatterns.some(p=>full.includes(p))) continue;
      if (it.isDirectory()) walk(full);
      else out.push(full);
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return out;
}
