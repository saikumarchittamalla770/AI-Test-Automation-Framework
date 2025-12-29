
import { ensureWorkspaceAndPull, getDiffFiles } from '../../infra/git/gitClient.js';
import { analyzeAndGenerate } from '../../app/analyzeAndGenerate.js';
import { runFullSuite } from '../../app/runFullSuite.js';
import { log } from 'console';

// export default async function  runRoute(req, res) {
//   try {
//     const { repoUrl, branch='main', baseUrl } = req.body;
//     console.log("req.body::"+req.body);
    
//     const wsName = Buffer.from(repoUrl).toString('hex');
//     const { repoPath, prevCommit, newCommit, workspaceDir } = await ensureWorkspaceAndPull({ repoUrl, branch, workspaceName: wsName });
//     const changed = (prevCommit && newCommit && prevCommit !== newCommit) ? await getDiffFiles(repoPath, prevCommit, newCommit) : [];
//     const out = await analyzeAndGenerate({ repoPath, workspaceDir, baseUrl, changedFiles: changed });
//     // const runRes = await runFullSuite(workspaceDir);
//     console.log('Run result:', out);
//     res.json({ workspace: wsName, journeys: out.journeys.map(j=>j.name)});
//   } catch (e) {
//     res.status(500).json({ error: String(e) });
//   }
// }


export default async function runRoute(req, res) {
  console.log("🚀 /api/run endpoint HIT");

  console.log("📥 Received Body:", JSON.stringify(req.body, null, 2));

  try {
    const { repoUrl, branch = 'main', baseUrl } = req.body;

    if (!repoUrl || !baseUrl) {
      return res.status(400).json({ error: "repoUrl and baseUrl are required" });
    }

    // const wsName = Buffer.from(repoUrl).toString('hex');
    // console.log("🛠 Workspace Name:", wsName);
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const wsName =`${repoName}_${branch}`;
    console.log("🛠 Workspace Name:", wsName);
    console.log("📡 Starting ensureWorkspaceAndPull...");
    const { repoPath, prevCommit, newCommit, workspaceDir } =
      await ensureWorkspaceAndPull({ repoUrl, branch, workspaceName: wsName });

    console.log("📁 Workspace details:", { repoPath, prevCommit, newCommit, workspaceDir });

    console.log("📃 Checking changed files...");
    const changed =
      prevCommit && newCommit && prevCommit !== newCommit
        ? await getDiffFiles(repoPath, prevCommit, newCommit)
        : [];

    console.log("📝 Changed files:", changed);

    console.log("🤖 Running analyzeAndGenerate...");
    const out = await analyzeAndGenerate({
      repoPath,
      workspaceDir,
      baseUrl,
      changedFiles: changed,
    });

    console.log("🏁 Final Output:", JSON.stringify(out, null, 2));

    return res.json({
      workspace: wsName,
      journeys: out?.journeys || [],
    });

  } catch (e) {
    console.error("❌ Error in API:", e);
    return res.status(500).json({ error: String(e) });
  }
}


