// ============================================
// AHRTAL FLUTKATASTROPHE - ZUSAETZLICHE LAYER
// Ueberschwemmungsgebiet (Hochwasserlinie)
// DOP40 Sonderbefliegung Hochwasser (WMS)
// ============================================

/**
 * Laedt zusaetzliche Kartenlayer fuer die Ahrtal-Flutkatastrophe:
 * - Ueberschwemmungsgebiet (UESG) Ahr
 * - DOP40 Sonderbefliegung Hochwasser 2021 (WMS)
 * 
 * Datenquellen:
 * - Geoportal RLP / SGD Nord
 */

function loadAhrtalLayers(map, allLayers) {
  console.log('[Ahrtal] Lade Hochwasserlinie und Luftbilder...');
  
  // ============================================
  // UEBERSCHWEMMUNGSGEBIET (UESG) AHR
  // ============================================
  
  // Speichere Map-Referenz global fuer spaetere Verwendung
  window.ahrtalMap = map;
  
  // Lade UESG-Daten aus lokaler JSON-Datei
  loadUESGDataFromFile(map, allLayers);
  
  // ============================================
  // DOP40 HOCHWASSER-LUFTBILDER (WMS)
  // ============================================
  
  // Lade DOP40 Sonderbefliegung als WMS-Layer
  loadDOP40WMSLayer(map, allLayers);
  
  console.log('[Ahrtal] Ahrtal-Layer erfolgreich initialisiert');
}

// ============================================
// DOP40 WMS-LAYER LADEN
// ============================================

function loadDOP40WMSLayer(map, allLayers) {
  console.log('[DOP40] Lade WMS-Layer fuer Hochwasser-Luftbilder...');
  
  // WMS-Layer von Geoportal RLP
  var dop40WMS = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop40_sonderbefliegung_hochwasser',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy; <a href="https://www.geoportal.rlp.de" target="_blank">Geoportal RLP</a> - DOP40 Sonderbefliegung Hochwasser 2021',
    maxZoom: 22,
    opacity: 0.85
  });
  
  // Speichere Layer global
  window.dop40WMSLayer = dop40WMS;
  allLayers.push(dop40WMS);
  
  // Fuege zur Legende hinzu
  addDOP40ToLegend(map);
  
  console.log('[DOP40] WMS-Layer erfolgreich erstellt');
}

// ============================================
// DOP40-LAYER ZUR RECHTEN LEGENDE HINZUFUEGEN
// ============================================

function addDOP40ToLegend(map) {
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (!legendControl) {
      console.warn('[DOP40] Keine Legende gefunden');
      return;
    }
    
    // Erstelle neue Sektion fuer DOP40 Luftbilder
    var dop40Section = document.createElement('div');
    dop40Section.className = 'legend-date-section';
    dop40Section.innerHTML = `
      <div class="legend-date-header" style="background: #fff3e0;">
        <span class="section-toggle-icon" id="dop40-toggle">▼</span>
        <div class="date-header-content">
          <strong style="color: #e65100;">DOP40 Hochwasser-Luftbilder</strong>
          <small style="color: #e65100;">Sonderbefliegung Juli 2021 (40cm Auflösung)</small>
        </div>
      </div>
      <div class="legend-date-content" id="dop40-content">
        <div class="legend-item-compact">
          <input type="checkbox" id="dop40-toggle-checkbox">
          <label for="dop40-toggle-checkbox" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <span class="legend-symbol-small" style="background: linear-gradient(135deg, #ff9800 0%, #e65100 100%); border: 2px solid #e65100;"></span>
            <span class="layer-name">Luftbilder Hochwasser 2021</span>
          </label>
        </div>
        
        <div style="margin-top: 10px; padding: 6px; background: #fff; border: 1px solid #ff9800; border-radius: 4px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer;">
            <span style="font-weight: 600; color: #e65100;">Transparenz:</span>
            <input type="range" id="dop40-opacity-slider" min="0" max="100" value="85" 
                   style="flex: 1; cursor: pointer;">
            <span id="dop40-opacity-value" style="min-width: 35px; text-align: right; color: #e65100;">85%</span>
          </label>
        </div>
        
        <div style="margin-top: 8px; padding: 6px; background: #f5f5f5; border-radius: 4px; font-size: 10px; color: #555;">
          <strong>Technische Details:</strong><br>
          • Bodenauflösung: 40 cm<br>
          • Befliegungszeitraum: Juli 2021<br>
          • Format: DOP (Digitales Orthophoto)<br>
          • Koordinatensystem: EPSG:25832<br><br>
          
          <strong>Hinweis:</strong><br>
          Hochauflösende Luftbildaufnahmen direkt nach der Flutkatastrophe. 
          Die Bilder zeigen das Ausmaß der Zerstörung unmittelbar nach dem Hochwasser.<br><br>
          
          <strong>Datenquelle:</strong> <a href="https://www.geoportal.rlp.de" target="_blank" style="color: #e65100;">Geoportal RLP</a>
        </div>
      </div>
    `;
    
    // Fuege die Sektion am Anfang der Legende ein (nach UESG)
    var uesgSection = legendControl.querySelector('.legend-date-section');
    if (uesgSection && uesgSection.nextSibling) {
      legendControl.insertBefore(dop40Section, uesgSection.nextSibling);
    } else {
      legendControl.appendChild(dop40Section);
    }
    
    // Event Listener fuer Toggle-Icon
    var headerElement = dop40Section.querySelector('.legend-date-header');
    var toggleIcon = document.getElementById('dop40-toggle');
    var toggleContent = document.getElementById('dop40-content');
    
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
    
    // Event Listener fuer Checkbox (Layer ein/aus)
    var checkbox = document.getElementById('dop40-toggle-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        var layer = window.dop40WMSLayer;
        var mapRef = window.ahrtalMap;
        
        if (!layer) {
          console.warn('[DOP40] Layer noch nicht geladen');
          this.checked = false;
          return;
        }
        
        if (!mapRef) {
          console.warn('[DOP40] Map-Referenz nicht gefunden');
          this.checked = false;
          return;
        }
        
        if (this.checked) {
          mapRef.addLayer(layer);
          console.log('[DOP40] Layer eingeblendet');
        } else {
          mapRef.removeLayer(layer);
          console.log('[DOP40] Layer ausgeblendet');
        }
      });
    }
    
    // Event Listener fuer Transparenz-Slider
    var opacitySlider = document.getElementById('dop40-opacity-slider');
    var opacityValue = document.getElementById('dop40-opacity-value');
    
    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener('input', function() {
        var opacity = this.value / 100;
        opacityValue.textContent = this.value + '%';
        
        var layer = window.dop40WMSLayer;
        if (layer && window.ahrtalMap.hasLayer(layer)) {
          layer.setOpacity(opacity);
          console.log('[DOP40] Transparenz geändert:', this.value + '%');
        }
      });
    }
    
    console.log('[DOP40] Legende erfolgreich erstellt');
  }, 900);
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