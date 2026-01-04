
import inquirer from 'inquirer';
import { ensureWorkspaceAndPull, getDiffFiles } from '../infra/git/gitClient.js';
import { analyzeAndGenerate } from '../app/analyzeAndGenerate.js';
import { runFullSuite } from '../app/runFullSuite.js';
import path from 'path';
import { WORKSPACE_ROOT } from '../config/env.js';

async function main(){
  const answers = await inquirer.prompt([
    { name:'repoUrl', message:'GitHub repo URL (HTTPS)' },
    { name:'branch', message:'Branch', default:'main' },
    { name:'baseUrl', message:'Base URL for tests (e.g. https://localhost:3000)' }
  ]);
  // const wsName = Buffer.from(answers.repoUrl).toString('hex');
  // console.log('Setting up workspace:', wsName);
  
  const repoName = answers.repoUrl.split('/').pop().replace('.git', '');
   const wsName =`${repoName}_${answers.branch}`;

   
  const { repoPath, prevCommit, newCommit, workspaceDir } = await ensureWorkspaceAndPull({ repoUrl: answers.repoUrl, branch: answers.branch, workspaceName: wsName });
  const changed = (prevCommit && newCommit && prevCommit !== newCommit) ? await getDiffFiles(repoPath, prevCommit, newCommit) : [];
  console.log('Analyzing...');  
  console.log("changed",changed);
  
  // const { journeys, files } = await analyzeAndGenerate({ repoPath, workspaceDir, baseUrl: answers.baseUrl, changedFiles: changed });
  // console.log('Generated tests:', files);
  // console.log('Running full suite...');
  // const result = await runFullSuite(workspaceDir);
  // console.log('Run result:', result);
}
main().catch(e=>{ console.error(e); process.exit(1); });
