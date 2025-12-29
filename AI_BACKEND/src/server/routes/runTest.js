// import fs from 'fs';
// import path from 'path';
// import runFullSuite from '../services/runFullSuite.js';
// import { WORKSPACE_ROOT } from '../../config/env.js'; // Adjust import path accordingly

// export default async function runTestRoute(req, res) {
//   try {
//     const workspaceId = req.query.workspaceId;

//     if (!workspaceId) {
//       return res.status(400).json({ error: 'Workspace ID is required' });
//     }

//     // 🔹 Join with WORKSPACE_ROOT instead of hardcoding process.cwd()
//     const workspaceDir = path.join(WORKSPACE_ROOT, workspaceId);

//     console.log('🔍 Workspace Directory:', workspaceDir);

//     if (!fs.existsSync(workspaceDir)) {
//       return res.status(404).json({
//         error: 'Workspace not found',
//         workspaceDir,
//       });
//     }

//     // 🔹 Pass correct workspace path to runFullSuite
//     const result = await runFullSuite(workspaceDir);

//     res.status(200).json({
//       message: 'Test execution completed',
//       workspaceId,
//       output: result?.output || 'No output received',
//       screenshotUrl: result?.screenshotUrl || null,
//     });

//   } catch (err) {
//     console.error('❌ Error executing test:', err);
//     res.status(500).json({
//       error: 'Test run failed',
//       details: err.message,
//     });
//   }
// }

import fs from 'fs';
import path from 'path';
import { runFullSuite } from '../../app/runFullSuite.js';
import { WORKSPACE_ROOT } from '../../config/env.js';

// function parseTestSummary(stdout) {
//   if (!stdout) return [];
//   const lines = stdout.split('\n');
//   const regex = /^[\s]*(✔|✘)\s+\d+.*$/;
//   return lines
//     .filter(line => regex.test(line.trim()))
//     .map(line => {
//       const [symbol, ...rest] = line.trim().split(' ');
//       return {
//         statusSymbol: symbol,
//         status: symbol === '✔' ? 'passed' : 'failed',
//         details: rest.join(' ').trim()
//       };
//     });
// }

// export default async function runTestRoute(req, res) {
//   try {
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Access-Control-Allow-Origin', '*'); // CORS FIX
//     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//     const workspaceId = req.query.workspaceId;

//     if (!workspaceId) {
//       return res.status(400).json({ error: 'Workspace ID is required' });
//     }

//     const workspaceDir = path.join(WORKSPACE_ROOT, workspaceId);

//     if (!fs.existsSync(workspaceDir)) {
//       return res.status(404).json({ error: 'Workspace not found', workspaceDir });
//     }

//     const result = await runFullSuite(workspaceDir);

//     console.log('✔️ runFullSuite output:', result);

//     const testSummary = parseTestSummary(result?.stdout || '');

//     console.log('🎯 Parsed Test Summary:', testSummary);

//     // 👉 Final return (ENSURE THIS IS THE LAST RESPONSE)
//     return res.status(200).json({
//       success: true,
//       message: 'Test execution completed successfully',
//       workspaceId,
//       totalTests: testSummary.length,
//       tests: testSummary,           // 👈 THIS is what frontend will receive
//       // fullOutput: result.stdout, // optional
//     });

//   } catch (err) {
//     console.error('🔥 API Error:', err);
//     return res.status(500).json({
//       success: false,
//       error: 'Test execution failed',
//       details: err?.message || err,
//     });
//   }
// }



// export default async function runTestRoute(req, res) {
//   try {
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//     const workspaceId = req.query.workspaceId;

//     if (!workspaceId) {
//       return res.status(400).json({ error: 'Workspace ID is required' });
//     }

//     const workspaceDir = path.join(WORKSPACE_ROOT, workspaceId);

//     if (!fs.existsSync(workspaceDir)) {
//       return res.status(404).json({ error: 'Workspace not found', workspaceDir });
//     }

//     const result = await runFullSuite(workspaceDir);

//     console.log('✔️ runFullSuite output:', result);

//     const tests = parseTestSummary(result?.stdout || '');

//     console.log('🎯 Parsed Test Summary:', tests);

//     return res.status(200).json({
//       success: true,
//       message: 'Test execution completed successfully',
//       workspaceId,
//       totalTests: tests.length,
//       totalPassed: tests.filter(t => t.status === 'passed').length,
//       totalFailed: tests.filter(t => t.status === 'failed').length,
//       tests
//     });

//   } catch (err) {
//     console.error('🔥 API Error:', err);
//     return res.status(500).json({
//       success: false,
//       error: 'Test execution failed',
//       details: err?.message || err,
//     });
//   }
// }


// function parseTestSummary(output) {
//   const lines = output.split('\n');
//   const parsedTests = [];

//   for (const line of lines) {
//     const match = line.match(/([✓✘])\s+(\d+)\s+([^:]+):(\d+):(\d+)\s+›\s+(.+?)\s+›\s+(.+?)(?:\s+\((.+?)\))?/);

//     if (match) {
//       parsedTests.push({
//         status: match[1] === '✓' ? 'passed' : 'failed',
//         testNumber: match[2],
//         file: match[3],
//         line: match[4],
//         column: match[5],
//         suite: match[6],
//         testName: match[7],
//         duration: match[8] || 'N/A'
//       });
//     }
//   }
//   return parsedTests;
// }


export default async function runTestRoute(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const workspaceId = req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    const workspaceDir = path.join(WORKSPACE_ROOT, workspaceId);

    if (!fs.existsSync(workspaceDir)) {
      return res.status(404).json({ error: 'Workspace not found', workspaceDir });
    }

    const result = await runFullSuite(workspaceDir);

    console.log('✔️ runFullSuite output:', result);

    const tests = parseTestSummary(result?.stdout || '');

    console.log('🎯 Parsed Test Summary:', tests);

    return res.status(200).json({
      success: true,
      message: 'Test execution completed successfully',
      workspaceId,
      totalTests: tests.length,
      tests: tests,   // 👈 shape: [{ statusSymbol, status, details }]
    });

  } catch (err) {
    console.error('🔥 API Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Test execution failed',
      details: err?.message || err,
    });
  }
}


function parseTestSummary(output) {
  const lines = output.split('\n');
  const parsed = [];

  for (const line of lines) {
    // Look for lines starting with ✓ or ✘ (with optional spaces before them)
    const match = line.match(/^\s*([✓✘])\s+(.*\S)\s*$/);
    if (!match) continue;

    const statusSymbol = match[1];
    const details = match[2]; // everything after the symbol

    parsed.push({
      statusSymbol,
      status: statusSymbol === '✓' ? 'passed' : 'failed',
      details,
    });
  }

  return parsed;
}