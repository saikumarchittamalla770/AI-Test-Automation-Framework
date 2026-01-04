
import { rerunJourney } from '../../app/rerunJourney.js';

export default async function rerunRoute(req, res) {
  try {
    const { workspace, journey } = req.body;
    const out = await rerunJourney(`/mnt/data/workspaces/${workspace}`, journey);
    res.json({ ok: true, out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
