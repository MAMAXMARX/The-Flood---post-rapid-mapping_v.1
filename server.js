// ============================================
// BACKEND SERVER FÜR RAPID MAPPING LEAFLET APP
// Node.js + Express
// ============================================

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS aktivieren
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// JSON Parser
app.use(express.json());

// Statische Dateien aus dem root-Verzeichnis servieren
app.use(express.static(path.join(__dirname)));

// ============================================
// API ENDPOINTS FÜR GEODATEN-PROXIES
// ============================================

/**
 * Proxy-Endpoint für lvermgeo.rlp.de Daten
 * GET /api/proxy/lvermgeo?url=...
 */
app.get('/api/proxy/lvermgeo', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL-Parameter erforderlich' 
      });
    }
    
    // URL validieren (nur lvermgeo.rlp.de zulassen)
    if (!url.includes('lvermgeo.rlp.de')) {
      return res.status(403).json({ 
        error: 'Nur lvermgeo.rlp.de URLs erlaubt' 
      });
    }
    
    console.log(`[PROXY] Abrufen: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rapid-Mapping-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`lvermgeo returned ${response.status}`);
    }
    
    // Content-Type erkennen
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      // Text/XML zurückgeben
      const data = await response.text();
      res.type('text/plain').send(data);
    }
    
  } catch (error) {
    console.error('[PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Geodaten',
      message: error.message 
    });
  }
});

/**
 * WMS Service Proxy
 * GET /api/proxy/wms?service=...&request=...&layers=...
 */
app.get('/api/proxy/wms', async (req, res) => {
  try {
    // Bestimme die richtige Base-URL basierend auf dem Layer-Namen
    const layers = req.query.layers || '';
    let baseUrl = 'https://geo4.service24.rlp.de/wms/hoeli.fcgi'; // Default
    
    if (layers.includes('rp_dop40_sonderbefliegung_hochwasser')) {
      // Sonderüberfliegung Ahr 2021
      baseUrl = 'https://geo4.service24.rlp.de/wms/rp_dop40_sonderbefliegung_hochwasser.fcgi';
    } else if (layers.includes('rp_hoeli')) {
      // Höhenlinien
      baseUrl = 'https://geo4.service24.rlp.de/wms/hoeli.fcgi';
    }
    
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = `${baseUrl}?${queryString}`;
    
    console.log(`[WMS PROXY] Service: ${layers} -> ${baseUrl}`);
    console.log(`[WMS PROXY] Abrufen: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Rapid-Mapping-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`WMS Service returned ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else if (contentType && contentType.includes('text/xml')) {
      const data = await response.text();
      res.type('application/xml').send(data);
    } else if (contentType && contentType.includes('image')) {
      const data = await response.buffer();
      res.type(contentType).send(data);
    } else {
      const data = await response.buffer();
      res.type(contentType || 'application/octet-stream').send(data);
    }
    
  } catch (error) {
    console.error('[WMS PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Fehler beim WMS-Abrufen',
      message: error.message 
    });
  }
});

/**
 * Proxy für beliebige externe Daten
 * GET /api/proxy?url=...
 */
app.get('/api/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL-Parameter erforderlich' 
      });
    }
    
    console.log(`[GENERAL PROXY] Abrufen: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rapid-Mapping-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Remote server returned ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const data = await response.buffer();
      res.type(contentType || 'application/octet-stream').send(data);
    }
    
  } catch (error) {
    console.error('[GENERAL PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Daten',
      message: error.message 
    });
  }
});

/**
 * Zusätzlicher lvermgeo Proxy (kompatibel mit lokaler Ausführung)
 * GET /api/lvermgeo?url=...
 */
app.get('/api/lvermgeo', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL-Parameter erforderlich' 
      });
    }
    
    // URL validieren (nur lvermgeo.rlp.de zulassen)
    if (!url.includes('lvermgeo.rlp.de') && !url.includes('geoserver.rlp.de')) {
      return res.status(403).json({ 
        error: 'Nur lvermgeo.rlp.de oder geoserver.rlp.de URLs erlaubt' 
      });
    }
    
    console.log(`[LVERMGEO PROXY] Abrufen: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rapid-Mapping-Server/1.0'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`lvermgeo returned ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } else if (contentType && contentType.includes('text/xml')) {
      const data = await response.text();
      res.setHeader('Content-Type', 'application/xml');
      res.send(data);
    } else if (contentType && contentType.includes('image')) {
      const data = await response.buffer();
      res.setHeader('Content-Type', contentType);
      res.send(data);
    } else {
      const data = await response.buffer();
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.send(data);
    }
    
  } catch (error) {
    console.error('[LVERMGEO PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen von lvermgeo-Daten',
      message: error.message,
      url: req.query.url
    });
  }
});

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Rapid Mapping Backend Server läuft',
    timestamp: new Date().toISOString()
  });
});

/**
 * Info Endpoint
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Rapid Mapping Backend Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      lvermgeoProxy: '/api/proxy/lvermgeo?url=...',
      wmsProxy: '/api/proxy/wms?service=...&request=...',
      generalProxy: '/api/proxy?url=...'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nicht gefunden',
    path: req.path 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ 
    error: 'Interner Serverfehler',
    message: err.message 
  });
});

// ============================================
// SERVER STARTEN
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  Rapid Mapping Backend Server             ║
║  Version 1.0.0                            ║
╠═══════════════════════════════════════════╣
║  Server läuft auf:                        ║
║  http://localhost:${PORT}                    ║
║                                           ║
║  API Endpoints:                           ║
║  - GET /api/health                        ║
║  - GET /api/info                          ║
║  - GET /api/proxy/lvermgeo                ║
║  - GET /api/proxy/wms                     ║
║  - GET /api/proxy                         ║
╚═══════════════════════════════════════════╝
  `);
  
  console.log('Drücke Ctrl+C zum Beenden');
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\nServer wird heruntergefahren...');
  process.exit(0);
});
