
// import fs from 'fs';
// import path from 'path';

// export function generatePlaywrightTests(journeys, workspaceDir, baseUrl) {
//   const testsDir = path.join(workspaceDir, 'tests');
//   if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
//   const files = [];
//   for (const journey of journeys) {
//     const name = journey.name.replace(/[^a-z0-9_-]/ig, '_').toLowerCase();
//     const filename = `${name}.spec.js`;
//     const lines = [
//       "const { test, expect } = require('@playwright/test');",
//       `test('${journey.name}', async ({ page }) => {`,
//       `  await page.goto('${baseUrl}');`
//     ];
//     let stepIndex = 1;
//     for (const s of journey.steps) {
//       if (s.action === 'goto' && s.url) lines.push(`  await page.goto('${baseUrl}${s.url}');`);
//       if (s.action === 'fill' && s.selector) lines.push(`  await page.fill(\`${s.selector}\`, '${(s.value||'').replace(/'/g,"\\'")}');`);
//       if (s.action === 'click' && s.selector) lines.push(`  await page.click(\`${s.selector}\`);`);
//       if (s.action === 'expect' && s.selector) lines.push(`  await expect(page.locator(\`${s.selector}\`)).toBeVisible();`);
//       lines.push(`  await page.screenshot({ path: 'proofs/${name}_step${stepIndex}.png' });`);
//       stepIndex++;
//     }
//     lines.push("});");
//     fs.writeFileSync(path.join(testsDir, filename), lines.join('\n'), 'utf8');
//     files.push(filename);
//   }
//   return files;
// }



// import fs from 'fs';
// import path from 'path';
// import prettier from "prettier";


// export function generatePlaywrightTests(journeys, workspaceDir, baseUrl) {
//   const outDir = path.join(workspaceDir, "tests");
//   if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

//   const createdFiles = [];
//   console.log(journeys);

//   for (const j of journeys) {
//     const fileName = j.name.toLowerCase().replace(/\s+/g, "-"); // better file naming
//     const filePath = path.join(outDir, `${fileName}.spec.js`);
    
//     const newContent = renderJourneyFile(j, baseUrl);
  
//     if (!fs.existsSync(filePath)) {
//       fs.writeFileSync(filePath, newContent);
//       createdFiles.push(filePath);
//       continue;
//     }
  
//     // PATCH EXISTING FILE (idempotent merge)
//     const old = fs.readFileSync(filePath, "utf8");
//     const combined = mergeTestFiles(old, newContent);
//     fs.writeFileSync(filePath, combined);
//     createdFiles.push(filePath);
//   }
  

//   return createdFiles;
// }

// function renderJourneyFile(journey, baseUrl) {
//   return `
// import { test, expect } from '@playwright/test';

// test.describe('${journey.name}', () => {

//   const BASE_URL = '${baseUrl}';

//   ${renderPaths(journey)}

// });
// `.trim();
// }

// function renderPaths(journey) {
//   const blocks = [];

//   for (const [pathName, steps] of Object.entries(journey.paths)) {
//     blocks.push(`
// test('${journey.id} – ${pathName} path', async ({ page }) => {
//   await page.goto(BASE_URL);

//   ${steps.map(step => renderStep(step)).join("\n  ")}
// });
// `);
//   }

//   return blocks.join("\n");
// }

// function renderStep(s) {
//   switch (s.action) {
//     case "goto": return `await page.goto('${s.url}');`;
//     case "click": return `await page.locator('${s.selector}').click();`;
//     case "fill": return `await page.locator('${s.selector}').fill('${s.value || ""}');`;
//     case "expect":
//       return `await expect(page.locator('${s.selector}')).toBe${capitalize(s.assert)}();`;
//     default:
//       return `// TODO: unsupported step type: ${s.action}`;
//   }
// }

// function capitalize(x) {
//   return x.charAt(0).toUpperCase() + x.slice(1);
// }


// export function mergeTestFiles(existingContent, newContent) {
//   const existingBlocks = extractTestBlocks(existingContent);
//   const newBlocks = extractTestBlocks(newContent);

//   // If the file has no test blocks (unlikely), fallback to override
//   if (Object.keys(existingBlocks).length === 0) {
//     return newContent;
//   }

//   // Merge: keep everything in existing file, replace only changed test blocks
//   let merged = existingContent;

//   for (const key of Object.keys(newBlocks)) {
//     const newBlock = newBlocks[key];

//     if (existingBlocks[key]) {
//       // Replace existing test block with updated block
//       merged = merged.replace(existingBlocks[key], newBlock);
//     } else {
//       // New test block → append at the end of describe()
//       merged = appendInsideDescribe(merged, newBlock);
//     }
//   }

//   return formatJS(merged);
// }


// function formatJS(js) {
//   try {
//     return prettier.format(js, { parser: "babel" });
//   } catch (err) {
//     return js;
//   }
// }


// function extractTestBlocks(content) {
//   const blocks = {};
//   const regex = /test\(['"`](.*?)['"`],\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}\);/g;

//   let match;
//   while ((match = regex.exec(content)) !== null) {
//     const fullBlock = match[0];
//     const testName = match[1].trim(); // e.g. "login_flow – happy path"
//     blocks[testName] = fullBlock;
//   }

//   return blocks;
// }


// function appendInsideDescribe(content, newBlock) {
//   const describeEnd = content.lastIndexOf("});");

//   if (describeEnd === -1) {
//     // fallback: append at bottom
//     return content + "\n\n" + newBlock + "\n";
//   }

//   return (
//     content.slice(0, describeEnd) +
//     "\n\n  " + newBlock + "\n\n" +
//     content.slice(describeEnd)
//   );
// }
 
// src/core/generator/playwrightGenerator.js
// import { log } from 'console';
// import fs from 'fs';
// import path from 'path';

// // write JSON testdata placeholder file
// function writeTestDataFile(testDataDir, name, testData) {
//   const file = path.join(testDataDir, `${name}.json`);
//   fs.writeFileSync(file, JSON.stringify(testData, null, 2), 'utf8');
// }

// // build normalized list
// function normalizeJourneysInput(input) {
//   if (!input) return [];
//   if (Array.isArray(input)) return input;
//   if (Array.isArray(input.journeys)) return input.journeys;
//   return [];
// }

// function slug(name) {
//   return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
// }

// // render a single JS step
// function renderStep(step) {
//   if (!step || !step.action) return `// TODO: missing step`;
//   const a = step.action;
//   if (a === 'goto') return `await page.goto(\`${step.url}\`);`;
//   if (a === 'click') return `await page.locator(\`${step.selector}\`).click();`;
//   if (a === 'fill') {
//     const val = step.value && typeof step.value === 'string' ? step.value : `{{${step.dataKey||'value'}}}`;
//     return `await page.locator(\`${step.selector}\`).fill(testData['${step.dataKey||'__unknown'}'] || '${val}');`;
//   }
//   if (a === 'expect') {
//     if (step.assert === 'visible') return `await expect(page.locator(\`${step.selector}\`)).toBeVisible();`;
//     if (step.assert === 'text') return `await expect(page.locator(\`${step.selector}\`)).toHaveText(${JSON.stringify(step.value||'')});`;
//     return `// TODO: expect ${step.assert}`;
//   }
//   if (a === 'waitForResponse' && step.waitFor && step.waitFor.match) {
//     return `await page.waitForResponse(resp => resp.url().includes(\`${step.waitFor.match}\`) && resp.status() >= 200);`;
//   }
//   if (a === 'waitForSelector') return `await page.waitForSelector(\`${step.selector || step.waitFor?.match}\`);`;
//   return `// TODO: action ${a}`;
// }

// // render a path block (array of steps)
// function renderPathTest(journeyId, pathName, steps) {
//   const title = `${journeyId} - ${pathName}`;
//   const lines = [];
//   lines.push(`test('${title}', async ({ page }) => {`);
//   lines.push(`  await page.goto(BASE_URL);`);
//   let idx = 1;
//   for (const s of steps) {
//     const body = renderStep(s);
//     lines.push(`  ${body}`);
//     lines.push(`  await page.screenshot({ path: 'proofs/${journeyId}_${pathName}_step${idx}.png' });`);
//     idx++;
//   }
//   lines.push(`});`);
//   return lines.join('\n');
// }

// // extract test blocks keyed by test title
// function extractTestBlocks(content) {
//   const blocks = {};
//   // match `test('...', async ({ page }) => { ... });` including multiline body (non-greedy)
//   const regex = /test\(\s*['"`]([\s\S]*?)['"`]\s*,\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}\s*\);\s*/g;
//   let m;
//   while ((m = regex.exec(content)) !== null) {
//     const title = m[1].trim();
//     const full = m[0];
//     blocks[title] = full;
//   }
//   return blocks;
// }

// // append newBlock inside the first describe() block or at end
// function appendInsideDescribe(content, newBlock) {
//   const describeIndex = content.indexOf('test.describe(');
//   if (describeIndex === -1) return content + '\n\n' + newBlock + '\n';
//   // find the closing "});" for the first describe by searching from end
//   const lastDescribeEnd = content.lastIndexOf('});');
//   if (lastDescribeEnd === -1) return content + '\n\n' + newBlock + '\n';
//   return content.slice(0, lastDescribeEnd) + '\n\n' + newBlock + '\n\n' + content.slice(lastDescribeEnd);
// }

// // merge: replace any matching block, append if missing
// export function mergeTestFiles(existingContent, newContent) {
//   try {
//     const existingBlocks = extractTestBlocks(existingContent);
//     const newBlocks = extractTestBlocks(newContent);

//     if (Object.keys(existingBlocks).length === 0) {
//       return newContent; // nothing to merge into
//     }

//     let merged = existingContent;

//     for (const title of Object.keys(newBlocks)) {
//       const newBlock = newBlocks[title];
//       if (existingBlocks[title]) {
//         // replace the exact old block with new block
//         merged = merged.replace(existingBlocks[title], newBlock);
//       } else {
//         // append
//         merged = appendInsideDescribe(merged, newBlock);
//       }
//     }
//     return merged;
//   } catch (err) {
//     // fallback: return newContent to ensure tests are up to date
//     console.warn('mergeTestFiles failed, falling back to overwrite:', err);
//     return newContent;
//   }
// }

// export function generatePlaywrightTests(journeysInput, workspaceDir, baseUrl) {
//   const journeys = normalizeJourneysInput(journeysInput);
//   console.log('Generating Playwright tests for journeys:', journeys);
  
//   const testsDir = path.join(workspaceDir, 'tests');
//   const testDataDir = path.join(workspaceDir, 'testdata');
//   const proofsDir = path.join(workspaceDir, 'proofs');
  
//   [testsDir, testDataDir, proofsDir].forEach(d => {
//     if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
//   });

//   const created = [];

//   for (const j of journeys) {
//     const id = slug(j.id || j.name || `journey_${Math.random().toString(36).slice(2,8)}`);
//     const file = path.join(testsDir, `${id}.spec.js`);
//     const testDataKeys = Array.isArray(j.testDataKeys) ? j.testDataKeys : (j.testDataKeys = []);
//     // write placeholder testdata JSON
//     console.log("testDataKeys",testDataKeys);
    
//     const testData = {};
//     for (const k of testDataKeys) testData[k] = `{{${k}}}`;
//     writeTestDataFile(testDataDir, id, testData);

    
//     // build new file content
//     // const header = `import { test, expect } from '@playwright/test';\n\nconst BASE_URL = '${baseUrl}';\n\n`;
//     // let body = `test.describe('${j.name}', () => {\n\n`;
//     // for (const [pathName, steps] of Object.entries(j.paths || {})) {
//     //   body += renderPathTest(id, pathName, steps) + '\n\n';
//     // }
//     // body += `});\n`;

//     const header = `import { test, expect } from '@playwright/test';\n\nconst BASE_URL = '${baseUrl}';\n\n`;
// let body = `test.describe('${j.name}', () => {\n\n`;

// for (const scenario of j.scenarios || []) {
//   body += renderPathTest(
//     slug(j.name),
//     slug(scenario.scenario || scenario.id),
//     scenario.steps || []
//   ) + '\n\n';
// }

// body += `});\n`;


//     const newContent = header + body;
//     console.log('Generated test content for', file, ':\n', newContent);
//     if (!fs.existsSync(file)) {
//       fs.writeFileSync(file, newContent, 'utf8');
//       created.push(file);
//       continue;
//     }

//     const old = fs.readFileSync(file, 'utf8');
//     const merged = mergeTestFiles(old, newContent);
//     fs.writeFileSync(file, merged, 'utf8');
//     created.push(file);
//   }

//   return created;
// }
 
// import fs from 'fs';
// import path from 'path';
// import { expect } from '@playwright/test';

// // 📌 Utility: Normalize journeys input
// function normalizeJourneysInput(input) {
//   if (!input) return [];
//   if (Array.isArray(input)) return input;
//   if (input.journeys && Array.isArray(input.journeys)) return input.journeys;
//   return [];
// }

// // 📌 Utility: Create safe slug
// function slug(name) {
//   return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
// }

// // 📌 Render individual step
// function renderStep(step) {
//   if (!step || !step.action) return `// ⚠️ Missing step`;

//   switch (step.action) {
//     case 'goto':
//       return `await page.goto(\`${step.url}\`);`;

//     case 'click':
//       return `await page.locator(\`${step.selector}\`).click();`;

//     case 'fill':
//       return `await page.locator(\`${step.selector}\`).fill(${JSON.stringify(step.value || '{{value}}')});`;

//     case 'expect':
//       return `await expect(page.locator(\`${step.selector}\`)).toBeVisible();`;

//     default:
//       return `// ⚠️ Unsupported action: ${step.action}`;
//   }
// }

// // 📌 Render test block for each scenario
// function renderPathTest(journeyName, scenarioName, steps) {
//   const title = `${journeyName} - ${scenarioName}`;
//   const lines = [];

//   lines.push(`test('${title}', async ({ page }) => {`);
//   lines.push(`  await page.goto(BASE_URL);`);

//   let index = 1;
//   for (const step of steps) {
//     lines.push(`  ${renderStep(step)}`);
//     lines.push(`  await page.screenshot({ path: 'proofs/${title}_step${index}.png' });`);
//     index++;
//   }

//   lines.push(`});`);   // Close test block
//   lines.push('');      // Add clean line separation
//   return lines.join('\n');
// }

// // 📌 Extract test blocks from existing file
// function extractTestBlocks(content) {
//   const blocks = {};
//   const regex = /test\(['"`](.*?)['"`], async[\s\S]*?\}\);\s*/g;

//   let match;
//   while ((match = regex.exec(content)) !== null) {
//     blocks[match[1]] = match[0];
//   }
//   return blocks;
// }

// // 📌 Append test block properly
// function appendInsideDescribe(content, newBlock) {
//   const describeEnd = content.lastIndexOf('});');
//   if (describeEnd === -1) return content + '\n' + newBlock;
//   return content.slice(0, describeEnd) + '\n' + newBlock + '\n' + content.slice(describeEnd);
// }

// // 📌 Merge new test content with existing file
// export function mergeTestFiles(existingContent, newContent) {
//   try {
//     const existingBlocks = extractTestBlocks(existingContent);
//     const newBlocks = extractTestBlocks(newContent);

//     let updatedContent = existingContent;

//     for (const [title, newBlock] of Object.entries(newBlocks)) {
//       if (existingBlocks[title]) {
//         updatedContent = updatedContent.replace(existingBlocks[title], newBlock);
//       } else {
//         updatedContent = appendInsideDescribe(updatedContent, newBlock);
//       }
//     }

//     return updatedContent;
//   } catch (err) {
//     console.warn('⚠️ Merge failed, using new content:', err);
//     return newContent;
//   }
// }

// // 📌 Main Test Generation Function
// export function generatePlaywrightTests(journeysInput, workspaceDir, baseUrl) {
//   const journeys = normalizeJourneysInput(journeysInput);
//   console.log('🔍 Generating tests for:', journeys);

//   const testsDir = path.join(workspaceDir, 'tests');
//   const proofsDir = path.join(workspaceDir, 'proofs');

//   [testsDir, proofsDir].forEach(d => {
//     if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
//   });

//   const createdFiles = [];

//   for (const j of journeys) {
//     const journeyName = slug(j.name);
//     const filePath = path.join(testsDir, `${journeyName}.spec.js`);

//     let fileContent = `import { test, expect } from '@playwright/test';\n\nconst BASE_URL = '${baseUrl}';\n\n`;
//     fileContent += `test.describe('${j.name}', () => {\n\n`;

//     for (const scenario of j.scenarios || []) {
//       fileContent += renderPathTest(journeyName, slug(scenario.scenario || 'scenario'), scenario.steps || []);
//     }

//     fileContent += `});\n`;   // CLOSE describe()

//     if (fs.existsSync(filePath)) {
//       const existingContent = fs.readFileSync(filePath, 'utf8');
//       fileContent = mergeTestFiles(existingContent, fileContent);
//     }

//     fs.writeFileSync(filePath, fileContent, 'utf8');
//     createdFiles.push(filePath);

//     console.log(`✅ Generated Test File: ${filePath}`);
//   }

//   return createdFiles;
// }


// src/core/generator/playwrightGenerator.js
import fs from 'fs';
import path from 'path';

/**
 * Playwright generator - single file
 *
 * Capabilities:
 * - normalize journeys (scenarios -> paths)
 * - create testdata/*.json and import in generated spec
 * - render step -> Playwright ESM code
 * - merge existing test files (replace blocks by title or append)
 * - ensure BASE_URL has protocol (add http:// if missing)
 */

// ------------------------ helpers ------------------------

function normalizeJourneysInput(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.journeys)) return input.journeys;
  // if object contains "patches" or similar, return empty
  return [];
}

function slug(name) {
  if (!name) name = 'journey_' + Math.random().toString(36).slice(2,8);
  return String(name).replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

function ensureUrlHasProtocol(u) {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return 'http://' + u;
}

function writeJsonFile(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

// Convert steps with placeholder value {{valid.email}} -> key "valid.email" or "email" depending
function placeholderToKey(value) {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^\s*\{\{\s*([^}\s]+)\s*\}\}\s*$/);
  if (!m) return null;
  // key might be "valid.email" -> return last part "email"
  const parts = m[1].split('.');
  return parts.length ? parts[parts.length - 1] : m[1];
}

// convert legacy "scenarios" to "paths"
function scenariosToPaths(journey) {
  if (!journey) return {};
  if (journey.paths && Object.keys(journey.paths).length) return journey.paths;
  const paths = {};
  if (Array.isArray(journey.scenarios) && journey.scenarios.length) {
    let idx = 1;
    for (const sc of journey.scenarios) {
      const name = sc.name || sc.title || `scenario_${idx++}`;
      const steps = [];
      // allow sc.given, sc.when, sc.then arrays or sc.steps
      if (Array.isArray(sc.steps)) {
        for (const s of sc.steps) steps.push(s);
      } else {
        if (sc.given) {
          if (sc.given.url) steps.push({ action: 'goto', url: sc.given.url });
        }
        if (Array.isArray(sc.when)) for (const w of sc.when) steps.push(w);
        if (Array.isArray(sc.then)) for (const t of sc.then) steps.push(t);
      }
      paths[name] = steps;
    }
  }
  return paths;
}

// ------------------------ render step -> code ------------------------

function renderStep(step) {
  if (!step || !step.action) return `// TODO: missing step`;
  const a = step.action;
  if (a === 'goto') {
    const url = step.url || step.value || '/';
    return `await page.goto(\`\${BASE_URL}${url.startsWith('/') ? '' : '/'}${url.replace(/^\//,'')}\`);`;
  }
  if (a === 'click') {
    if (!step.selector) return `// TODO: click missing selector`;
    return `await page.locator(\`${step.selector}\`).click();`;
  }
  if (a === 'fill') {
    if (!step.selector) return `// TODO: fill missing selector`;
    // prefer dataKey, then placeholder value
    const key = step.dataKey || placeholderToKey(step.value) || step.field || '__unknown';
    return `await page.locator(\`${step.selector}\`).fill(testData['${key}'] || '');`;
  }
  if (a === 'select') {
    return `await page.selectOption(\`${step.selector}\`, ${JSON.stringify(step.value || '')});`;
  }
  if (a === 'upload') {
    return `await page.setInputFiles(\`${step.selector}\`, ${JSON.stringify(step.value || '')});`;
  }
  if (a === 'expect') {
    if (step.assert === 'visible') return `await expect(page.locator(\`${step.selector}\`)).toBeVisible();`;
    if (step.assert === 'hidden') return `await expect(page.locator(\`${step.selector}\`)).toBeHidden();`;
    if (step.assert === 'text') return `await expect(page.locator(\`${step.selector}\`)).toHaveText(${JSON.stringify(step.value||'')});`;
    if (step.assert === 'url') return `await expect(page).toHaveURL(\`${step.value}\`);`;
    return `// TODO: expect ${JSON.stringify(step)}`;
  }
  if (a === 'waitForResponse' && step.waitFor && step.waitFor.match) {
    return `await page.waitForResponse(resp => resp.url().includes(\`${step.waitFor.match}\`) && resp.status() >= 200);`;
  }
  if (a === 'waitForSelector') {
    return `await page.waitForSelector(\`${step.selector || step.waitFor?.match}\`);`;
  }
  if (a === 'evaluate') {
    return `await page.evaluate(${step.value || '() => {}'});`;
  }
  return `// TODO: unsupported action ${a}`;
}

// ------------------------ render path (test) ------------------------

function renderPathTest(journeyId, pathName, steps) {
  const testTitle = `${journeyId} - ${pathName}`;
  const lines = [];
  lines.push(`test('${escapeSingleQuotes(testTitle)}', async ({ page }) => {`);
  lines.push(`  // start`);
  lines.push(`  await page.goto(BASE_URL);`);
  let i = 1;
  for (const st of steps || []) {
    // add optional note comment
    if (st.notes) lines.push(`  // ${sanitizeInline(st.notes)}`);
    lines.push(`  ${renderStep(st)}`);
    // take screenshot as proof
    lines.push(`  await page.screenshot({ path: \`proofs/${journeyId}_${sanitizeFileName(pathName)}_step${i}.png\` });`);
    i++;
  }
  lines.push(`});`);
  return lines.join('\n');
}

function escapeSingleQuotes(s) { return String(s || '').replace(/'/g, "\\'"); }
function sanitizeInline(s) { return String(s || '').replace(/\r?\n/g, ' '); }
function sanitizeFileName(s) { return String(s || '').replace(/[^a-z0-9-_\.]/gi, '_').toLowerCase(); }

// ------------------------ merge support ------------------------

// extract test blocks keyed by full test title
// function extractTestBlocks(content) {
//   const blocks = {};
//   if (!content) return blocks;
//   // match test('TITLE', async ({ page }) => { ... });
//   const regex = /test\(\s*['"`]([\s\S]*?)['"`]\s*,\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}\s*\)\s*;\s*/g;
//   let m;
//   while ((m = regex.exec(content)) !== null) {
//     const title = m[1].trim();
//     const full = m[0];
//     blocks[title] = full;
//   }
//   return blocks;
// }

// function extractTestBlocks(content) {
//   const blocks = {};
//   if (!content) return blocks;

//   // Matches: test('title', async (...) => { ... });
//   const regex = /test\s*\(\s*['"`](.*?)['"`]\s*,[\s\S]*?async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}\s*\)\s*;/g;
//   let match;

//   while ((match = regex.exec(content)) !== null) {
//     const title = match[1].trim();
//     const fullBlock = match[0];
//     blocks[title] = fullBlock;
//   }

//   return blocks;
// }

import * as acorn from "acorn";
import * as walk from "acorn-walk";

function extractTestBlocks(content) {
  const blocks = {};
  const ast = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module' });

  walk.simple(ast, {
    CallExpression(node) {
      if (node.callee.name === "test" && node.arguments?.length >= 2) {
        const titleNode = node.arguments[0];
        if (titleNode.type === "Literal" || titleNode.type === "StringLiteral") {
          const title = titleNode.value;
          const fullText = content.substring(node.start, node.end);
          blocks[title] = fullText;
        }
      }
    }
  });

  return blocks;
}




function appendInsideDescribe(content, newBlock) {
  // If describe exists, insert before the last `});` occurrence, otherwise append
  const lastDescribeEnd = content.lastIndexOf('});');
  if (lastDescribeEnd === -1) return content + '\n\n' + newBlock + '\n';
  return content.slice(0, lastDescribeEnd) + '\n\n' + newBlock + '\n\n' + content.slice(lastDescribeEnd);
}

/**
 * mergeTestFiles(existingContent, newContent)
 * - replace test blocks with same title
 * - append new blocks if missing
 * - preserve existing file header/imports
 */
export function mergeTestFiles(existingContent, newContent) {
  try {
    const oldBlocks = extractTestBlocks(existingContent);
    console.log('[mergeTestFiles] oldBlocks:', oldBlocks);
    
    const newBlocks = extractTestBlocks(newContent);

    console.log('[mergeTestFiles] newBlocks:', newBlocks);
    
    if (!existingContent || Object.keys(oldBlocks).length === 0) {
      // nothing to merge into — return new content
      console.log("existingContent",existingContent);
            
      return newContent;
    }

    let merged = existingContent;

    for (const title of Object.keys(newBlocks)) {
      const nb = newBlocks[title];
      if (oldBlocks[title]) {
        merged = merged.replace(oldBlocks[title], nb);
      } else {
        merged = appendInsideDescribe(merged, nb);
      }
    }

    return merged;
  } catch (err) {
    console.warn('[mergeTestFiles] failed, falling back to newContent', err);
    return newContent;
  }
}

// ------------------------ main generator ------------------------

export function generatePlaywrightTests(journeysInput, workspaceDir, baseUrl) {
  const journeys = normalizeJourneysInput(journeysInput || {});
  console.log('[generatePlaywrightTests] Generating Playwright tests for journeys:', journeys.map(j=>j.name||j.id||'unnamed'));

  const testsDir = path.join(workspaceDir, 'tests');
  const testDataDir = path.join(workspaceDir, 'testdata');
  const proofsDir = path.join(workspaceDir, 'proofs');

  [testsDir, testDataDir, proofsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const created = [];

  baseUrl = ensureUrlHasProtocol(baseUrl || 'http://localhost:3000');

  for (const jRaw of journeys) {
    // normalize
    const j = Object.assign({}, jRaw);
    j.paths = scenariosToPaths(j);
    const id = slug(j.id || j.name || `journey_${Math.random().toString(36).slice(2,8)}`);
    const filename = `${id}.spec.js`;
    const file = path.join(testsDir, filename);

    // determine testDataKeys
    const keys = Array.isArray(j.testDataKeys) ? j.testDataKeys.slice() : [];
    // also infer from steps with placeholders
    for (const stepsArr of Object.values(j.paths || {})) {
      for (const s of (stepsArr || [])) {
        if (s && typeof s.value === 'string') {
          const k = placeholderToKey(s.value);
          if (k && !keys.includes(k)) keys.push(k);
        }
        if (s && s.dataKey && !keys.includes(s.dataKey)) keys.push(s.dataKey);
      }
    }

    // write testdata json (only if not present)
    const testDataObj = {};
    for (const kk of keys) testDataObj[kk] = `{{${kk}}}`;
    const testDataFile = path.join(testDataDir, `${id}.json`);
    if (!fs.existsSync(testDataFile)) {
      writeJsonFile(testDataFile, testDataObj);
    }

    // Build file content
    const headerLines = [
      `import { test, expect } from '@playwright/test';`,
      `import testData from '../testdata/${id}.json';`,
      ``,
      `const BASE_URL = \`${baseUrl}\`;`,
      ``,
    ];
    let body = `test.describe('${escapeSingleQuotes(String(j.name||id))}', () => {\n\n`;

    // add each path test
    for (const [pathName, steps] of Object.entries(j.paths || {})) {
      body += renderPathTest(id, pathName, steps) + '\n\n';
    }
    body += `});\n`;

    const newContent = headerLines.join('\n') + '\n' + body;
    console.log('[generatePlaywrightTests] Generated test content for', file, ':\n', newContent);
    
    // write or merge
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, newContent, 'utf8');
      created.push(file);
      continue;
    }

    const old = fs.readFileSync(file, 'utf8');
    console.log('[generatePlaywrightTests] Merging with existing old:', old);
    
    const merged = mergeTestFiles(old, newContent);
    console.log('[generatePlaywrightTests] Merged:', merged);
    fs.writeFileSync(file, merged, 'utf8');
    created.push(file);
  }

  console.log('[generatePlaywrightTests] Generated tests:', created);
  return created;
}
