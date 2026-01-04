
import fs from 'fs';
import path from 'path';
export default function artifactsRoute(req,res){
  const workspace = req.params.workspace;
  // const dir = path.join('/mnt/data/workspaces', workspace, 'proofs');
  const dir = workspace;
  console.log("Artifacts dir:", dir);
  

  if (!fs.existsSync(dir)) return res.json({ proofs: [] });
  const files = [];
  function walk(d){
    for(const it of fs.readdirSync(d)){
      const full = path.join(d,it);
      if (fs.statSync(full).isDirectory()) walk(full);
      // else files.push({ path: full, name: path.relative(path.join('/mnt/data/workspaces', workspace), full) });
      else files.push({ path: full, name: path.relative( workspace), full });

    }
  }
  console.log("Reading artifacts from:", files);
  
  walk(dir);
  res.json({ proofs: files });
}
