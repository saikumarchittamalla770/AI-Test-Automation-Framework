import fs from "fs";
import path from "path";

/**
 * Detects correct project root even if the repo contains multiple folders.
 * We scan all folders and return the one containing package.json.
 */
export function resolveProjectRoot(repoPath) {
  const items = fs.readdirSync(repoPath);

  // 1. Check direct package.json
  if (items.includes("package.json")) {
    return repoPath;
  }

  // 2. Scan all subfolders for package.json
  for (const item of items) {
    const full = path.join(repoPath, item);

    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      if (fs.existsSync(path.join(full, "package.json"))) {
        return full;  // <-- return first match
      }
    }
  }

  // 3. Fallback: repo itself
  return repoPath;
}
