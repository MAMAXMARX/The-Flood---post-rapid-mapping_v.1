// ============================================
// VERCEL SERVERLESS FUNCTION - HEALTH CHECK
// ============================================

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    status: 'ok',
    message: 'Rapid Mapping Backend Server (Vercel) läuft',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
};
