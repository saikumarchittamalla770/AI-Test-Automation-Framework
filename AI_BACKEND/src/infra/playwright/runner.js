import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export function runAllTests(workspaceDir, workers=process.env.PW_WORKERS || 4) {
  return new Promise(async (resolve) => {

    const possibleTestDirs = [
      path.join(workspaceDir, 'tests'),
      path.join(workspaceDir, 'generated-tests'),
      path.join(workspaceDir, 'generated'),
      path.join(workspaceDir, 'playwright'),
    ];

    let testDir = null;

    for (const dir of possibleTestDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        if (files.some(f => f.endsWith('.spec.js') || f.endsWith('.test.js'))) {
          testDir = dir;
          break;
        }
      }
    }

    if (!testDir) {
      return resolve({
        err: "NO_TESTS_FOUND",
        stdout: "",
        stderr: "No *.spec.js files detected in workspace."
      });
    }

    const outputDir = path.join(workspaceDir, 'proofs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    const reportFile = path.join(outputDir, "report.json");
    // const cmd = `npx playwright test "${testDir}" --workers=${workers} --output="${outputDir}"`;
    const cmd = `cd "${testDir}" && npx playwright test --workers=${workers} --output="${outputDir}" `;
    exec(cmd, { cwd: workspaceDir, maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
      
      resolve({
        err: err ? String(err) : null,
        stdout,
        stderr
      });
    });
  });
}
 


// -------- Helper: Extract test details with error messages --------
function extractResults(json) {
  if (!json || !json.suites) return null;

  let result = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function walkSuite(suite) {
    if (suite.tests) {
      for (const t of suite.tests) {
        result.total++;

        const status = t.outcome || t.status;
        if (status === "passed") result.passed++;
        else result.failed++;

        result.tests.push({
          name: t.title,
          status,
          error: t.error ? (t.error.message || t.error.stack) : null
        });
      }
    }

    if (suite.suites) {
      suite.suites.forEach(walkSuite);
    }
  }

  json.suites.forEach(walkSuite);

  return result;
}

 

export function runSingleTest(workspaceDir, testFile) {
  return new Promise((resolve) => {
    const cmd = `npx playwright test ${testFile} --output=${workspaceDir}/proofs`;
    exec(cmd, { cwd: workspaceDir, maxBuffer: 1024*1024*20 }, (err, stdout, stderr) => {
      resolve({ err: err ? String(err) : null, stdout, stderr });
    });
  });
}



// import fs from 'fs';
// import path from 'path';
// import { exec } from 'child_process';

// // export function runAllTests(workspaceDir, workers = process.env.PW_WORKERS || 4) {
// //   return new Promise(async (resolve) => {
// //     try {
// //       const possibleTestDirs = [
// //         path.join(workspaceDir, 'tests'),
// //         path.join(workspaceDir, 'generated-tests'),
// //         path.join(workspaceDir, 'generated'),
// //         path.join(workspaceDir, 'playwright'),
// //       ];

// //       let testDir = null;

// //       for (const dir of possibleTestDirs) {
// //         if (fs.existsSync(dir)) {
// //           const files = fs.readdirSync(dir);
// //           if (files.some(f => /\.(spec|test)\.(js|ts)$/i.test(f))) {
// //             testDir = dir;
// //             break;
// //           }
// //         }
// //       }

// //       if (!testDir) {
// //         return resolve({
// //           status: 'NO_TESTS',
// //           message: 'No test files found (*.spec.ts|*.test.ts|*.spec.js|*.test.js)',
// //           total: 0,
// //           passed: 0,
// //           failed: 0
// //         });
// //       }

// //       const outputDir = path.join(workspaceDir, 'proofs');
// //       if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// //       const reportFile = path.join(outputDir, 'report.json');
// //       const cmd = `npx playwright test --workers=${workers} --output="${outputDir}" --reporter=json > "${reportFile}"`;

// //       console.log(`🚀 Running Playwright in: ${testDir}`);
// //       console.log(`📂 Saving artifacts to: ${outputDir}`);

// //       exec(cmd, { cwd: testDir, maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
// //         let parsedReport = null;

// //         if (err) {
// //           console.error('❌ Playwright Failed to Execute:', err.message);
// //           return resolve({
// //             status: 'FAILED_TO_EXECUTE',
// //             errorMessage: err.message,
// //             stdout,
// //             stderr
// //           });
// //         }

// //         try {
// //           if (fs.existsSync(reportFile)) {
// //             parsedReport = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
// //           }
// //         } catch (e) {
// //           parsedReport = null;
// //         }

// //         const formattedResults = extractResults(parsedReport);
// //         const total = formattedResults?.total || 0;
// //         const passed = formattedResults?.passed || 0;
// //         const failed = formattedResults?.failed || 0;

// //         return resolve({
// //           total,
// //           passed,
// //           failed,
// //           status: failed > 0 ? 'FAILED' :
// //                   passed > 0 ? 'PASSED' :
// //                   'NO_TESTS'
// //         });
// //       });
// //     } catch (error) {
// //       console.error('🔥 Unexpected Server Error:', error);
// //       resolve({
// //         status: 'SERVER_ERROR',
// //         message: error.message,
// //       });
// //     }
// //   });
// // }


// // export function runAllTests(workspaceDir, workers = process.env.PW_WORKERS || 4) {
// //   return new Promise(async (resolve) => {
// //     try {
// //       const possibleTestDirs = [
// //         path.join(workspaceDir, 'tests'),
// //         path.join(workspaceDir, 'generated-tests'),
// //         path.join(workspaceDir, 'generated'),
// //         path.join(workspaceDir, 'playwright'),
// //       ];

// //       let testDir = null;

// //       for (const dir of possibleTestDirs) {
// //         if (fs.existsSync(dir)) {
// //           const files = fs.readdirSync(dir);
// //           if (files.some(f => /\.(spec|test)\.(js|ts)$/i.test(f))) {
// //             testDir = dir;
// //             break;
// //           }
// //         }
// //       }

// //       if (!testDir) {
// //         return resolve({
// //           status: 'NO_TESTS',
// //           message: 'No test files found (*.spec|*.test)',
// //           total: 0,
// //           passed: 0,
// //           failed: 0,
// //         });
// //       }

// //       const outputDir = path.join(workspaceDir, 'proofs');
// //       if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// //       const reportFile = path.join(outputDir, 'report.json');

// //       // 🎯 Correct command - FIRST cd, THEN run Playwright IN THAT DIRECTORY
// //       let cmd;
// //       if (process.platform === 'win32') {
// //         cmd = `cd /d "${testDir}" && npx playwright test --workers=${workers} --reporter=json --output="${outputDir}" > "${reportFile}"`;
// //       } else {
// //         cmd = `cd "${testDir}" && npx playwright test --workers=${workers} --reporter=json --output="${outputDir}" > "${reportFile}"`;
// //       }

// //       console.log('📂 Running command:', cmd);

// //       exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
// //         if (err) {
// //           console.error('❌ Playwright Runtime Error:', err.message);
// //           return resolve({
// //             status: 'FAILED_TO_EXECUTE',
// //             errorMessage: err.message,
// //             stdout,
// //             stderr,
// //           });
// //         }

// //         let parsedReport = null;
// //         try {
// //           if (fs.existsSync(reportFile)) {
// //             parsedReport = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
// //           }
// //         } catch (e) {
// //           parsedReport = null;
// //         }

// //         const formattedResults = extractResults(parsedReport);
// //         const total = formattedResults?.total || 0;
// //         const passed = formattedResults?.passed || 0;
// //         const failed = formattedResults?.failed || 0;

// //         resolve({
// //           total,
// //           passed,
// //           failed,
// //           status: failed > 0 ? 'FAILED' :
// //                   passed > 0 ? 'PASSED' :
// //                   'NO_TESTS'
// //         });
// //       });

// //     } catch (error) {
// //       console.error('🔥 Internal Server Error:', error);
// //       resolve({ status: 'SERVER_ERROR', errorMessage: error.message });
// //     }
// //   });
// // }


// export function runSingleTest(workspaceDir, testFile) {
//   return new Promise((resolve) => {
//     const outputDir = path.join(workspaceDir, 'proofs');
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//     const cmd = `npx playwright test ${testFile} --output="${outputDir}"`;

//     exec(cmd, { cwd: workspaceDir, maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
//       resolve({ err: err ? String(err) : null, stdout, stderr });
//     });
//   });
// }

// /* -------- Helper: Extract results with meaningful test info -------- */
// function extractResults(json) {
//   if (!json || !json.suites) return null;

//   let result = { total: 0, passed: 0, failed: 0, tests: [] };

//   function walkSuite(suite) {
//     if (suite.tests) {
//       for (const t of suite.tests) {
//         result.total++;

//         const status = t.outcome || t.status;
//         if (status === 'passed') result.passed++;
//         else result.failed++;

//         result.tests.push({
//           name: t.title,
//           status,
//           error: t.error ? (t.error.message || t.error.stack) : null,
//         });
//       }
//     }

//     if (suite.suites) suite.suites.forEach(walkSuite);
//   }

//   json.suites.forEach(walkSuite);
//   return result;
// }


// // import fs from 'fs';
// // import path from 'path';
// // import { exec } from 'child_process';

// export function runAllTests(workspaceDir, workers = process.env.PW_WORKERS || 4) {
//   return new Promise(async (resolve) => {
//     try {
//       // Normalize paths
//       workspaceDir = path.resolve(workspaceDir);
//       const outputDir = path.join(workspaceDir, 'proofs');
//       const testDir = path.join(workspaceDir, 'tests');
//       const reportFile = path.join(outputDir, 'report.json');

//       // 🔹 Validate Playwright config
//       const configFileJs = path.join(workspaceDir, 'playwright.config.js');
//       const configFileTs = path.join(workspaceDir, 'playwright.config.ts');

//       if (!fs.existsSync(configFileJs) && !fs.existsSync(configFileTs)) {
//         return resolve({
//           status: 'NO_CONFIG',
//           message: '❌ playwright.config.js or playwright.config.ts not found!',
//         });
//       }

//       // Ensure output folder exists
//       if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//       // 👉 Final working command (no `cd`, uses cwd instead)
//       const cmd = `npx playwright test --workers=${workers} --reporter=json --output="${outputDir}" > "${reportFile}"`;

//       console.log('▶ Running:', cmd);
//       console.log('📁 CWD:', workspaceDir);

//       exec(cmd, { cwd: workspaceDir, shell: true, maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
//         if (err) {
//           return resolve({
//             status: 'FAILED_TO_EXECUTE',
//             message: err.message,
//             stderr,
//           });
//         }

//         let report = fs.existsSync(reportFile)
//           ? JSON.parse(fs.readFileSync(reportFile, 'utf8'))
//           : null;

//         const formatted = extractResults(report);

//         resolve({
//           status: formatted.failed > 0 ? 'FAILED' : 'PASSED',
//           ...formatted,
//         });
//       });

//     } catch (error) {
//       resolve({ status: 'SERVER_ERROR', message: error.message });
//     }
//   });
// }


// import fs from 'fs';
// import path from 'path';
// import { exec } from 'child_process';

// export function runAllTests(workspaceDir, workers = process.env.PW_WORKERS || 4) {
//   return new Promise(async (resolve) => {
//     try {
//       workspaceDir = path.resolve(workspaceDir);
//       const outputDir = path.join(workspaceDir, 'proofs');
//       const reportFile = path.join(outputDir, 'report.json');

//       const configFileJs = path.join(workspaceDir, 'playwright.config.js');
//       const configFileTs = path.join(workspaceDir, 'playwright.config.ts');

//       if (!fs.existsSync(configFileJs) && !fs.existsSync(configFileTs)) {
//         return resolve({
//           status: 'NO_CONFIG',
//           message: '❌ playwright.config.js or playwright.config.ts not found!',
//         });
//       }

//       if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//       // 🚀 FIX: No shell redirection, direct JSON output via reporter
//       // const cmd = `npx playwright test --workers=${workers} --reporter=json --reporter-output="${reportFile}" --output="${outputDir}"`;
//       const cmd = `npx playwright test --workers=${workers} --reporter=json --output="${outputDir}"`;

//       console.log('▶ Running:', cmd);
//       console.log('📁 CWD:', workspaceDir);

//       exec(cmd, { cwd: workspaceDir, shell: true, maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
//         if (err) {
//           return resolve({
//             status: 'FAILED_TO_EXECUTE',
//             message: err.message,
//             stdout,
//             stderr,
//           });
//         }

//         let report = null;
//         try {
//           if (fs.existsSync(reportFile)) {
//             report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
//           }
//         } catch (e) {
//           report = { parseError: e.message };
//         }

//         const formatted = extractResults(report);

//         resolve({
//           status: formatted?.failed > 0 ? 'FAILED' :
//                   formatted?.passed > 0 ? 'PASSED' :
//                   'NO_TESTS',
//           ...formatted,
//         });
//       });

//     } catch (error) {
//       resolve({ status: 'SERVER_ERROR', message: error.message });
//     }
//   });
// }
