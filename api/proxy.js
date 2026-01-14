// ============================================
// VERCEL SERVERLESS FUNCTION - PROXY
// ============================================

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async (req, res) => {
  // CORS Headers setzen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request behandeln
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET-Requests erlaubt' });
  }

  try {
    const { url, type } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL-Parameter erforderlich' });
    }

    console.log(`[PROXY] Abrufen: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rapid-Mapping-Vercel/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Remote server returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(data);
    } else {
      const data = await response.buffer();
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      return res.status(200).send(data);
    }
  } catch (error) {
    console.error('[PROXY ERROR]', error);
    res.status(500).json({
      error: 'Fehler beim Abrufen der Daten',
      message: error.message
    });
  }
};
