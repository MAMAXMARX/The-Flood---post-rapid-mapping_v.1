// ============================================
// AHRTAL FLUTKATASTROPHE - ZUSAETZLICHE LAYER
// Luftbilder 2019/2021 & Ueberschwemmungsgebiet
// ============================================

/**
 * Laedt zusaetzliche Kartenlayer fuer die Ahrtal-Flutkatastrophe:
 * - Luftbilder 2019 (vor der Flut)
 * - Luftbilder 2021 (nach der Flut) 
 * - Ueberschwemmungsgebiet (UESG) Ahr
 * 
 * Datenquellen:
 * - LVermGeo Rheinland-Pfalz (Open Data)
 * - Geoportal RLP / SGD Nord
 */

function loadAhrtalLayers(map, allLayers) {
  console.log('[Ahrtal] Lade Luftbilder & Hochwasserlinie...');
  
  // ============================================
  // LUFTBILDER 2019 (VOR DER FLUT)
  // ============================================
  
  var luftbild2019 = L.tileLayer.wms('http://geo4.service24.rlp.de/wms/dop_basis.fcgi', {
    layers: 'dop40',
    format: 'image/png',
    transparent: false,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 19,
    opacity: 1.0
  });
  
  // ============================================
  // LUFTBILDER 2021 (NACH DER FLUT)
  // ============================================
  
  var luftbild2021 = L.tileLayer.wms('http://geo4.service24.rlp.de/wms/dop_basis.fcgi', {
    layers: 'dop40',
    format: 'image/png',
    transparent: false,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 19,
    opacity: 1.0
  });
  
  // Hinweis: Sonderbefliegung muss separat beschafft werden
  var luftbild2021_hochwasser = L.tileLayer.wms('http://geo4.service24.rlp.de/wms/dop_basis.fcgi', {
    layers: 'dop40',
    format: 'image/png',
    transparent: false,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 19,
    opacity: 1.0
  });
  
  // ============================================
  // LAYER ZU ARRAYS HINZUFUEGEN
  // ============================================
  
  allLayers.push(luftbild2019);
  allLayers.push(luftbild2021);
  allLayers.push(luftbild2021_hochwasser);
  
  // ============================================
  // LAYER ZUR BASISKARTEN-CONTROL HINZUFUEGEN
  // ============================================
  
  // Verwende das global gespeicherte Layer Control
  if (window.globalLayerControl) {
    window.globalLayerControl.addBaseLayer(luftbild2019, "Luftbild Aktuell (DOP40)");
    window.globalLayerControl.addBaseLayer(luftbild2021, "Luftbild Alternativ");
    window.globalLayerControl.addBaseLayer(luftbild2021_hochwasser, "Luftbild Historisch");
    console.log('[Ahrtal] Luftbild-Layer zur Basiskarten-Auswahl hinzugefuegt');
  } else {
    console.error('[Ahrtal] Layer Control nicht gefunden - window.globalLayerControl ist undefined');
  }
  
  // ============================================
  // UEBERSCHWEMMUNGSGEBIET (UESG) AHR
  // ============================================
  
  // Speichere Map-Referenz global fuer spaetere Verwendung
  window.ahrtalMap = map;
  
  // Lade UESG-Daten aus lokaler JSON-Datei
  loadUESGDataFromFile(map, allLayers);
  
  console.log('[Ahrtal] Ahrtal-Layer erfolgreich initialisiert');
}

// ============================================
// UESG-DATEN AUS LOKALER JSON-DATEI LADEN
// ============================================

function loadUESGDataFromFile(map, allLayers) {
  console.log('[UESG] Lade Ueberschwemmungsgebiet-Daten aus lokaler Datei...');
  
  // Lade lokale JSON-Datei
  fetch('uesg_ahr.json')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('UESG JSON-Datei nicht gefunden: ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      console.log('[UESG] Daten erfolgreich geladen:', data);
      
      // Die Datei enthaelt ein einzelnes Feature, konvertiere zu FeatureCollection
      var featureCollection = {
        type: 'FeatureCollection',
        features: [data]
      };
      
      // Erstelle GeoJSON Layer
      var uesgLayer = L.geoJSON(featureCollection, {
        style: function(feature) {
          return {
            color: '#00ffb3ff',
            weight: 1,
            opacity: 0.5,
            fillColor: '#00ffb37b',
            fillOpacity: 0.3,
            dashArray: '5, 5'
          };
        },
        onEachFeature: function(feature, layer) {
          var props = feature.properties || {};
          var popupContent = '<div style="font-family: Arial; font-size: 12px;">';
          popupContent += '<strong>Ueberschwemmungsgebiet Ahr</strong><br>';
          popupContent += '<em>' + (props.STAND_BEZ || 'Vorlaeufig sichergestellt') + '</em><br><br>';
          
          if (props.GEW_NAME) {
            popupContent += '<strong>Gewaesser:</strong> ' + props.GEW_NAME + '<br>';
          }
          if (props.HQ) {
            popupContent += '<strong>Bemessungshochwasser:</strong> HQ ' + props.HQ + '<br>';
          }
          if (props.RVO_DATUM) {
            popupContent += '<strong>Datum:</strong> ' + props.RVO_DATUM + '<br>';
          }
          if (props.STRECKE) {
            popupContent += '<strong>Strecke:</strong> ' + props.STRECKE + '<br>';
          }
          
          popupContent += '<br><small>Datenquelle: <a href="https://sgdnord.rlp.de" target="_blank">SGD Nord RLP</a></small>';
          popupContent += '</div>';
          
          layer.bindPopup(popupContent);
        }
      });
      
      // Speichere Layer global
      window.uesgAhrLayer = uesgLayer;
      allLayers.push(uesgLayer);
      
      // Fuege zur Legende hinzu
      addUESGToLegend(map);
      
      console.log('[UESG] Layer erfolgreich erstellt und zur Legende hinzugefuegt');
    })
    .catch(function(error) {
      console.error('[UESG] Fehler beim Laden der lokalen Datei:', error);
      console.log('[UESG] Stelle sicher, dass uesg_ahr.json im gleichen Verzeichnis wie index.html liegt');
    });
}

// ============================================
// UESG-LAYER ZUR RECHTEN LEGENDE HINZUFUEGEN
// ============================================

function addUESGToLegend(map) {
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (!legendControl) {
      console.warn('[UESG] Keine Legende gefunden');
      return;
    }
    
    // Erstelle neue Sektion fuer Ueberschwemmungsgebiet
    var uesgSection = document.createElement('div');
    uesgSection.className = 'legend-date-section';
    uesgSection.innerHTML = `
      <div class="legend-date-header" style="background: #e3f2fd;">
        <span class="section-toggle-icon" id="uesg-toggle">▼</span>
        <div class="date-header-content">
          <strong style="color: #0066cc;">Ueberschwemmungsgebiet Ahr</strong>
          <small style="color: #0066cc;">Vorlaeufig sichergestellt (Par.76 Abs. 3 WHG)</small>
        </div>
      </div>
      <div class="legend-date-content" id="uesg-content">
        <div class="legend-item-compact">
          <input type="checkbox" id="uesg-toggle-checkbox">
          <label for="uesg-toggle-checkbox" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <span class="legend-symbol-small" style="background: linear-gradient(135deg, #0099ff 0%, #0066cc 100%); border: 2px solid #0066cc;"></span>
            <span class="layer-name">Hochwasserlinie 2021</span>
          </label>
        </div>
        <div style="margin-top: 8px; padding: 6px; background: #f5f5f5; border-radius: 4px; font-size: 10px; color: #555;">
          <strong>Hinweis:</strong><br>
          Zeigt die vorlaeufig sichergestellte Ueberschwemmungsflaeche der Ahrtal-Flut vom Juli 2021.<br><br>
          <strong>Datenquelle:</strong> <a href="https://sgdnord.rlp.de" target="_blank" style="color: #0066cc;">SGD Nord RLP</a> / 
          <a href="https://www.geoportal.rlp.de" target="_blank" style="color: #0066cc;">Geoportal RLP</a>
        </div>
      </div>
    `;
    
    // Fuege die Sektion am Anfang der Legende ein
    var firstSection = legendControl.querySelector('.legend-date-section');
    if (firstSection) {
      legendControl.insertBefore(uesgSection, firstSection);
    } else {
      legendControl.appendChild(uesgSection);
    }
    
    // Event Listener fuer Toggle-Icon
    var headerElement = uesgSection.querySelector('.legend-date-header');
    var toggleIcon = document.getElementById('uesg-toggle');
    var toggleContent = document.getElementById('uesg-content');
    
    if (headerElement && toggleIcon && toggleContent) {
      headerElement.addEventListener('click', function() {
        if (toggleContent.style.display === 'none') {
          toggleContent.style.display = 'block';
          toggleIcon.textContent = '▼';
        } else {
          toggleContent.style.display = 'none';
          toggleIcon.textContent = '▶';
        }
      });
    }
    
    // Event Listener fuer Checkbox
    var checkbox = document.getElementById('uesg-toggle-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        var layer = window.uesgAhrLayer;
        var mapRef = window.ahrtalMap;
        
        if (!layer) {
          console.warn('[UESG] Layer noch nicht geladen');
          this.checked = false;
          return;
        }
        
        if (!mapRef) {
          console.warn('[UESG] Map-Referenz nicht gefunden');
          this.checked = false;
          return;
        }
        
        if (this.checked) {
          mapRef.addLayer(layer);
          console.log('[UESG] Layer eingeblendet');
        } else {
          mapRef.removeLayer(layer);
          console.log('[UESG] Layer ausgeblendet');
        }
      });
    }
    
    console.log('[UESG] Legende erfolgreich erstellt');
  }, 800);
}

// Exportiere die Hauptfunktion
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAhrtalLayers };
}