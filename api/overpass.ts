import type { VercelRequest, VercelResponse } from '@vercel/node';

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { data } = req.query;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Missing data parameter' });
  }

  for (const base of MIRRORS) {
    try {
      const url = `${base}?data=${encodeURIComponent(data)}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'crisis-reporter/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) continue;
      const json = await response.json();
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(json);
    } catch {
      continue;
    }
  }

  return res.status(502).json({ error: 'Overpass unavailable' });
}
