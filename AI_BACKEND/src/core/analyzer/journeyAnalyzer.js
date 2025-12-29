
// import { askChat, extractText } from '../../infra/openai/openaiClient.js';
// import { ANALYZE_PROMPT } from './prompts/analyzeCodePrompt.js';

// export async function analyzeJourneys({ framework, baseUrl, topFiles, changedFiles=[] }) {
//   const topPreview = topFiles.map(f=>`FILE: ${f.path}\nPREVIEW:\n${f.snippet.slice(0,800)}`).join('\n\n');
//   const prompt = ANALYZE_PROMPT(framework, baseUrl, topPreview, changedFiles);
//   const messages = [
//     { role: 'system', content: 'You are an expert at extracting user journeys from code.' },
//     { role: 'user', content: prompt }
//   ];
//   const resp = await askChat({ messages, model: 'gpt-4o-mini', max_tokens: 1500 });
//   const text = extractText(resp);
//   try {
//     const parsed = JSON.parse(text);
//     return parsed;
//   } catch (e) {
//     // fallback: attempt to extract JSON block
//     const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
//     if (m) {
//       try { return JSON.parse(m[0]); } catch {}
//     }
//     return [];
//   }
// }




// import { log } from 'console';
// import { askChat, extractText } from '../../infra/openai/openaiClient.js';
// import { FULL_ANALYZE_PROMPT, DIFF_ANALYZE_PROMPT } from './prompts/analyzePrompts.js';
// import fs from 'fs';
// import path from 'path';

// export async function analyzeJourneys({
//   framework,
//   baseUrl,
//   topFiles,
//   changedFiles = [],
//   workspaceDir,
// }) {
//   const journeysFile = path.join(workspaceDir, "journeys.json");
//   const existingJourneys = fs.existsSync(journeysFile)
//     ? JSON.parse(fs.readFileSync(journeysFile, "utf8"))
//     : { journeys: [] };

//   let prompt = "";
//   let mode = "";

//   if (changedFiles.length === 0) {
//     // ---------------------------
//     // FULL ANALYSIS MODE
//     // ---------------------------
//     console.log("Running full analysis...");
//     mode = "full";
//     const topPreview = topFiles
//       .map(f => `FILE: ${f.path}\nPREVIEW:\n${f.snippet.slice(0, 800)}`)
//       .join("\n\n");
//     prompt = FULL_ANALYZE_PROMPT(framework, baseUrl, topPreview);
//   } else {
//     // ---------------------------
//     // DIFF MODE (incremental)
//     // ---------------------------
//     console.log("Running diff analysis...");
//     mode = "diff";
//     const changedPreview = changedFiles
//       .map(f => `FILE: ${f.path}\nPREVIEW:\n${f.snippet.slice(0, 800)}`)
//       .join("\n\n");
//     prompt = DIFF_ANALYZE_PROMPT(
//       framework,
//       baseUrl,
//       changedPreview,
//       existingJourneys
//     );
//   }

//   const messages = [
//     { role: 'system', content: 'You are an expert static-analysis engine.' },
//     { role: 'user', content: prompt },
//   ];

//   const resp = await askChat({
//     messages,
//     model: 'gpt-4o-mini',
//     max_tokens: 2500,
//   });

//   console.log("resp"+JSON.stringify(resp));
  

//   const text = extractText(resp);

//   console.log("text"+JSON.stringify(text));
  

//   let parsed;
//   try {
//     parsed = JSON.parse(text);
//     console.log("parsed"+JSON.stringify(parsed));
    
//   } catch (e) {
//     const m = text.match(/\{[\s\S]*\}/);
//     parsed = m ? JSON.parse(m[0]) : null;
//   }
//   if (!parsed) return existingJourneys;

//   if (mode === "full") {

//     // Save full result
//     fs.writeFileSync(journeysFile, JSON.stringify(parsed, null, 2));
//     console.log("parsed journeysFile"+JSON.stringify(parsed));
    
//     return parsed;
//   }

//   if (mode === "diff") {
//     const patches = parsed.patches || [];
//     const updatedJourneys = applyJourneyPatches(existingJourneys, patches);

//     fs.writeFileSync(journeysFile, JSON.stringify(updatedJourneys, null, 2));
//     return updatedJourneys;
//   }
// }


// function applyJourneyPatches(existing, patches) {
//   const journeys = [...existing.journeys];

//   for (const p of patches) {
//     if (p.type === "new_journey") {
//       journeys.push(p.journey);
//       continue;
//     }

//     const j = journeys.find(x => x.id === p.journeyId);
//     if (!j) continue;

//     const path = p.changes.path;
//     const pathArr = j.paths[path] || [];

//     // Step replacements
//     if (p.changes.replace) {
//       for (const r of p.changes.replace) {
//         pathArr[r.index] = r.step;
//       }
//     }

//     // Insertions
//     if (p.changes.insert) {
//       for (const ins of p.changes.insert) {
//         pathArr.splice(ins.index, 0, ins.step);
//       }
//     }

//     // Deletions
//     if (p.changes.remove) {
//       for (const rm of p.changes.remove) {
//         pathArr.splice(rm.index, 1);
//       }
//     }

//     j.paths[path] = pathArr;
//   }

//   return { journeys };
// }

 // src/core/analyzer/analyzeJourneys.js
import { askChat, extractText } from '../../infra/openai/openaiClient.js';
import { FULL_ANALYZE_PROMPT, DIFF_ANALYZE_PROMPT } from './prompts/analyzePrompts.js';
import fs from 'fs';
import path from 'path';

function safeParseJson(text) {
  if (!text) return null;
  // Try direct parse
  try { return JSON.parse(text); } catch (e) {}
  // Try to extract the first {...} or [...] block
  const m = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

function ensureJourneysSchema(obj) {
  if (!obj) return { journeys: [] };
  if (Array.isArray(obj)) return { journeys: obj };
  if (Array.isArray(obj.journeys)) return obj;
  // If object contains "patches" only, keep existing
  if (Array.isArray(obj.patches)) return obj;
  return { journeys: [] };
}

/**
 * analyzeJourneys
 * - mode: full (changedFiles empty) or diff (changedFiles provided)
 * - accepts topFiles as [{ path, snippet }, ...]
 * - changedFiles can be [ 'file/path' ] or [ { path, snippet } ]
 */
export async function analyzeJourneys({
  framework = 'auto',
  baseUrl = '',
  topFiles = [],
  changedFiles = [],
  workspaceDir = process.cwd()
} = {}) {

  const journeysFile = path.join(workspaceDir, 'journeys.json');
  const existingJourneys = fs.existsSync(journeysFile)
    ? safeParseJson(fs.readFileSync(journeysFile, 'utf8')) || { journeys: [] }
    : { journeys: [] };

  // Normalize input previews safely
  const buildPreview = arr => (Array.isArray(arr) ? arr : [])
    .map(f => {
      if (!f) return '';
      if (typeof f === 'string') return `FILE: ${f}\nPREVIEW:\n`;
      return `FILE: ${f.path || f.file || 'unknown'}\nPREVIEW:\n${(f.snippet || '').slice(0, 1200)}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const isDiff = Array.isArray(changedFiles) && changedFiles.length > 0;

  let promptText = '';
  let mode = isDiff ? 'diff' : 'full';

  if (!isDiff) {
    console.log('[analyzeJourneys] Running FULL analysis...');
    const previews = buildPreview(topFiles);
    promptText = FULL_ANALYZE_PROMPT({ framework, baseUrl, previews });
  } else {
    console.log('[analyzeJourneys] Running DIFF analysis...');
    // normalize changedFiles into {path,snippet}
    const normalizedChanged = changedFiles.map(f => {
      if (!f) return { path: String(f || ''), snippet: '' };
      if (typeof f === 'string') return { path: f, snippet: '' };
      return { path: f.path || f.file || '', snippet: f.snippet || '' };
    }).filter(x => x.path);
    console.log("Changed files preview normalized:",normalizedChanged);
    
    const changedPreviews = buildPreview(normalizedChanged);
    console.log('[analyzeJourneys] Changed files preview:\n', changedPreviews);    
    console.log("existingJourneys",existingJourneys);
    
    promptText = DIFF_ANALYZE_PROMPT({
      framework,
      baseUrl,
      changedPreviews,
      existingJourneysJson: JSON.stringify(existingJourneys, null, 2)
    });
  }

  const messages = [
    { role: 'system', content: 'You are an expert static-analysis engine.' },
    { role: 'user', content: promptText }
  ];

  // Call LLM
  const resp = await askChat({
    messages,
    model: 'gpt-4.1',
    max_tokens: 2500,
    temperature: 0.0
  });

  console.log("LLM response:", JSON.stringify(resp));
  
  const text = extractText(resp);
  if (!text) {
    console.warn('[analyzeJourneys] LLM returned empty text. Returning existing journeys.');
    return existingJourneys;
  }
console.log("LLM output text:", text);

  const parsed = safeParseJson(text);
  if (!parsed) {
    console.warn('[analyzeJourneys] Could not parse LLM output as JSON. Returning existing journeys.');
    return existingJourneys;
  }
  console.log("LLM output parsed:", parsed);

  if (mode === 'full') {
    // Expect { journeys: [...] } or array
    const out = Array.isArray(parsed) ? { journeys: parsed } : parsed;
    const normalized = ensureJourneysSchema(out);
    fs.writeFileSync(journeysFile, JSON.stringify(normalized, null, 2), 'utf8');
    console.log('[analyzeJourneys] FULL analysis saved journeys.json');
    return normalized;
  }

  // DIFF mode => expect { patches: [...] }
  const patches = Array.isArray(parsed.patches) ? parsed.patches : [];
  console.log("patches::",patches);
  
  const merged = applyJourneyPatches(existingJourneys, patches);
  console.log("merged",merged);
  
  fs.writeFileSync(journeysFile, JSON.stringify(merged, null, 2), 'utf8');
  console.log('[analyzeJourneys] DIFF applied and saved journeys.json');
  return merged;
}


/**
 * applyJourneyPatches(existing, patches)
 * - existing: { journeys: [...] }
 * - patches: [ { type, journeyId, changes } ... ]
 */
export function applyJourneyPatches(existing = { journeys: [] }, patches = []) {
  const journeys = Array.isArray(existing.journeys) ? [...existing.journeys] : [];

  for (const p of patches || []) {
    if (!p || !p.type) continue;

    if (p.type === 'new_journey' && p.journey) {
      journeys.push(p.journey);
      continue;
    }

    if (p.type === 'remove_journey' && p.journeyId) {
      const idx = journeys.findIndex(j => j.id === p.journeyId);
      if (idx >= 0) journeys.splice(idx, 1);
      continue;
    }

    if (p.type === 'modify_journey' && p.journeyId && p.changes) {
      const j = journeys.find(jj => jj.id === p.journeyId);
      if (!j) continue;
      j.paths = j.paths || {};
      const pathName = p.changes.path;
      const arr = Array.isArray(j.paths[pathName]) ? [...j.paths[pathName]] : [];

      // replace
      // if (Array.isArray(p.changes.replace)) {
      //   for (const r of p.changes.replace) {
      //     if (typeof r.index === 'number') arr[r.index] = r.step;
      //   }
      // }

      if (Array.isArray(p.changes.replace)) {
        for (const r of p.changes.replace) {
          if (typeof r.index === 'number' && arr[r.index]) {
            arr[r.index] = { ...arr[r.index], ...r.step }; // ⭐ Correctly merging fields
          }
        }
      }
    
      // insert
      if (Array.isArray(p.changes.insert)) {
        // to keep indexes stable, sort inserts by index ascending and apply
        const inserts = [...p.changes.insert].sort((a,b) => (a.index||0) - (b.index||0));
        for (const ins of inserts) {
          const idx = typeof ins.index === 'number' ? ins.index : arr.length;
          arr.splice(idx, 0, ins.step);
        }
      }
      // remove
      if (Array.isArray(p.changes.remove)) {
        // remove descending to preserve indexes
        const rems = p.changes.remove.map(x => x.index).filter(n => typeof n === 'number').sort((a,b) => b-a);
        for (const idx of rems) {
          if (idx >= 0 && idx < arr.length) arr.splice(idx, 1);
        }
      }

      j.paths[pathName] = arr;
      continue;
    }
  }

  return { journeys };
}
 