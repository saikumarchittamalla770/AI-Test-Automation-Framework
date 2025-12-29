
import { detectFramework } from '../core/analyzer/frameworkDetector.js';
import { collectTopFiles } from '../core/analyzer/codeCollector.js';
import { analyzeJourneys } from '../core/analyzer/journeyAnalyzer.js';
import { generatePlaywrightTests } from '../core/generator/playwrightGenerator.js';
import { resolveProjectRoot } from '../core/utils/resolveProjectRoot.js';
import fs from 'fs';
import path from 'path';

function resolveScanRoot(projectRoot) {
  const srcPath = path.join(projectRoot, "src");
  return fs.existsSync(srcPath) ? srcPath : projectRoot;
}


export async function analyzeAndGenerate({ repoPath, workspaceDir, baseUrl, changedFiles=[] }) {
  console.log('repoPath...', repoPath);  
  const projectRoot = resolveProjectRoot(repoPath);
  console.log('projectRoot...', projectRoot);  
  const framework = detectFramework(projectRoot);
  console.log('framework...', framework);  

  // Detect /src if present
  const scanRoot = resolveScanRoot(projectRoot);
  console.log("scanRoot...", scanRoot);

  const topFiles = await collectTopFiles(scanRoot, 60);
  console.log('topFiles...', topFiles);  
  const journeys = await analyzeJourneys({ framework, baseUrl, topFiles, changedFiles,workspaceDir });
  console.log('analyzed journeys...', journeys);
  const files = generatePlaywrightTests(journeys, workspaceDir, baseUrl);

  return { journeys, files };
}




