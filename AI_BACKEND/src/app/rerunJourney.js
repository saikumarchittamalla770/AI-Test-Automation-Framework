
import { runSingleTest } from '../infra/playwright/runner.js';
import path from 'path';
export async function rerunJourney(workspaceDir, journeyFile) {
  const testFile = path.join(workspaceDir, 'tests', journeyFile);
  return await runSingleTest(workspaceDir, testFile);
}
