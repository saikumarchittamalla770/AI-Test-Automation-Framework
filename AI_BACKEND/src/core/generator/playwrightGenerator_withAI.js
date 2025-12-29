
import fs from 'fs';
import path from 'path';
import { generateTestForJourney } from './openaiGenerator.js';

export async function generatePlaywrightTestsAI(journeys, workspaceDir, baseUrl) {
  const testsDir = path.join(workspaceDir, 'tests');
  if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
  const files = [];
  for (const j of journeys) {
    const safe = j.name.replace(/[^a-z0-9_-]/ig, '_').toLowerCase();
    const filename = `${safe}.spec.js`;
    const code = await generateTestForJourney(j);
    fs.writeFileSync(path.join(testsDir, filename), code, 'utf8');
    files.push(filename);
  }
  return files;
}
