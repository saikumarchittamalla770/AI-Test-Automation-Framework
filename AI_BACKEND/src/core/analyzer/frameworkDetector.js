
// import fs from 'fs';
// export function detectFramework(repoPath) {
//   try {
//     const pkg = JSON.parse(fs.readFileSync(repoPath + '/package.json','utf8'));
//     if (pkg.dependencies && pkg.dependencies.next) return 'nextjs';
//     if (pkg.dependencies && pkg.dependencies['react-router']) return 'react';
//     if (pkg.dependencies && pkg.dependencies.express) return 'express';
//     return 'unknown';
//   } catch { return 'unknown'; }
// }


import fs from 'fs';
import path from 'path';

export function detectFramework(repoPath) {
  try {
    const pkgPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return 'unknown';

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (!deps) return 'unknown';

    // ---- React ----
    if (deps.react) {
      if (deps.next) return 'nextjs';
      if (deps['react-router'] || deps['react-router-dom']) return 'react';
      return 'react';
    }

    // ---- Angular ----
    if (deps['@angular/core']) return 'angular';

    // ---- Vue ----
    if (deps.vue) return 'vue';

    // ---- Svelte ----
    if (deps.svelte) return 'svelte';

    // ---- Express ----
    if (deps.express) return 'express';

    // ---- Default ----
    return 'unknown';

  } catch (err) {
    console.error("Framework detection error:", err);
    return 'unknown';
  }
}
