
import { runAllTests } from '../infra/playwright/runner.js';
export async function runFullSuite(workspaceDir) {
  return await runAllTests(workspaceDir);
}
