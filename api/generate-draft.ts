import { handleGenerateDraft } from './_shared';

export default async function handler(req: any, res: any) {
  // CORS support if called cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await handleGenerateDraft(body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[API /api/generate-draft] Error:', err);
    return res.status(200).json({
      draft: 'I am reaching out regarding our situation so we can communicate clearly and constructively.',
      source: 'fallback',
      error: err?.message,
    });
  }
}
