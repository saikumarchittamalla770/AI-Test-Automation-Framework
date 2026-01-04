// src/core/analyzer/prompts/analyzePrompts.js
export const FULL_ANALYZE_PROMPT = ({ framework, baseUrl, previews }) => `
You are an advanced static-analysis engine for frontend applications.
Framework: ${framework}
Base URL: ${baseUrl}

Input: a selection of files with previews:
${previews}

Task (FULL analysis):
- Discover ALL user journeys across the entire codebase, including form submission, authentication, and correct post-login navigation (detect actual redirect paths like /dashboard, /home, /contacts instead of assuming).
- For each journey produce an object with:
  - id (slug), name, description (one line), priority (high|medium|low)
  - paths: an object with keys "happy", "error", "alt" (each an array of steps)
  - testDataKeys: list of placeholder keys referenced in steps (e.g. ["email","password"])
  - fixtures: optional list of fixture names required (e.g. ["createUser"])
- Each step must be an object with:
  {
    "action":"goto|click|fill|select|upload|expect|waitForResponse|waitForSelector|waitForNavigation|evaluate",
    "url":"/login",               // only for goto
    "selector":"<css/role/text>",
    "value":"{{valid.email}}",    // placeholder; DO NOT fill real secrets
    "assert":"visible|hidden|text|url|contains",
    "waitFor": { "type":"response|selector|navigation", "match":"POST /api/login or selector" },
    "notes":"optional note about fragility"
  }
- Use placeholders for test-data values (format: {{valid.email}} or {{invalid.password}}).
- Detect the actual post-login redirect path from code (e.g., navigate(['/dashboard']) in Angular or routerLink="/home", or successful HTTP login response). Do not leave expected URLs empty.
- Output JSON with exact schema:
  { "journeys": [ { id,name,description,priority,paths,testDataKeys,fixtures } ] }

Rules:
- Output JSON ONLY (single JSON object).
- Keep the payload as compact JSON.
- If unsure, include placeholders and mark "confidence":"low|medium|high" on journeys.

End.
`.trim();

export const DIFF_ANALYZE_PROMPT = ({ framework, baseUrl, changedPreviews, existingJourneysJson }) => `
You are an incremental static-analysis engine. This request is NOT a full analysis.

Framework: ${framework}
Base URL: ${baseUrl}

Changed files (previews):
${changedPreviews}

Existing journeys metadata (JSON):
${existingJourneysJson}

Task (DIFF mode):
- Inspect ONLY the changed files and determine which existing journeys are affected.
- For each affected journey, produce a "patch" describing minimal updates:
  - type: "modify_journey" | "new_journey" | "remove_journey"
  - journeyId: "<id>" (for modify/remove)
  - For modify_journey include "changes": { path: "<happy|error|alt>", replace: [ { index: N, step: {...} } ], insert: [ { index: N, step: {...} } ], remove: [ { index: N } ] }
  - For new_journey include full journey object (same schema as FULL_ANALYZE_PROMPT)
  - For remove_journey include journeyId only
- If a selector changed, include the prior selector in "reason".
- Do NOT recreate unrelated journeys. If unchanged, do not include them in patches.
- Output JSON with this shape:
  { "patches": [ ... ] }
- Return JSON ONLY.

End.
`.trim();
 