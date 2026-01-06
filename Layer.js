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
  
  var luftbild2019 = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop20',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP 2019, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8,
    time: '2019'
  });
  
  // ============================================
  // LUFTBILDER 2021 (NACH DER FLUT)
  // ============================================
  
  var luftbild2021 = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop_rgb',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP 2021, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8,
    time: '2021'
  });
  
  // Alternative: Sonderbefliegung Hochwasser Ahr 2021 (DOP40)
  var luftbild2021_hochwasser = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop40_hochwasser',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '&copy;GeoBasis-DE / LVermGeoRP 2021 - Sonderbefliegung, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8
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
    window.globalLayerControl.addBaseLayer(luftbild2019, "Luftbild 2019 (vor Flut)");
    window.globalLayerControl.addBaseLayer(luftbild2021, "Luftbild 2021 (nach Flut)");
    window.globalLayerControl.addBaseLayer(luftbild2021_hochwasser, "Luftbild 2021 (Sonderbefliegung)");
    console.log('[Ahrtal] Luftbild-Layer zur Basiskarten-Auswahl hinzugefuegt');
  } else {
    console.error('[Ahrtal] Layer Control nicht gefunden - window.globalLayerControl ist undefined');
  }
  
  // ============================================
  // UEBERSCHWEMMUNGSGEBIET (UESG) AHR
  // ============================================
  
  // Speichere Map-Referenz global fuer spaetere Verwendung
  window.ahrtalMap = map;
  
  // Lade UESG-Daten als GeoJSON
  loadUESGData(map, allLayers);
  
  console.log('[Ahrtal] Ahrtal-Layer erfolgreich initialisiert');
}

// ============================================
// UESG-DATEN LADEN
// ============================================

function loadUESGData(map, allLayers) {
  console.log('[UESG] Lade Ueberschwemmungsgebiet-Daten...');
  
  var uesgLayer = null;
  
  // Versuche GeoJSON API
  fetch('https://www.geoportal.rlp.de/spatial-objects/325/collections/uesg:uesg_gesetzlich/items?f=json&limit=10000')
    .then(response => {
      if (!response.ok) {
        console.warn('[UESG] GeoJSON API nicht verfuegbar, versuche WFS...');
        return fetch('https://geodienste-wasser.rlp-umwelt.de/geoserver/uesg/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=uesg:uesg_gesetzlich&outputFormat=application/json&srsName=EPSG:4326');
      }
      return response;
    })
    .then(response => response.json())
    .then(data => {
      console.log('[UESG] Daten erfolgreich geladen:', data);
      
      // Filtere Ahr-Daten
      var ahrFeatures = [];
      if (data.features) {
        ahrFeatures = data.features.filter(function(f) {
          var name = (f.properties && (f.properties.gewaesser || f.properties.name || f.properties.GEWAESSER)) || '';
          return name.toLowerCase().includes('ahr');
        });
      }
      
      if (ahrFeatures.length === 0) {
        console.log('[UESG] Keine Ahr-spezifischen Daten gefunden, verwende alle Features');
        ahrFeatures = data.features || [];
      }
      
      console.log('[UESG] Ahr-Features gefunden:', ahrFeatures.length);
      
      // Erstelle GeoJSON Layer
      uesgLayer = L.geoJSON(ahrFeatures, {
        style: function(feature) {
          return {
            color: '#0066cc',
            weight: 2,
            opacity: 0.8,
            fillColor: '#0099ff',
            fillOpacity: 0.3,
            dashArray: '5, 5'
          };
        },
        onEachFeature: function(feature, layer) {
          var props = feature.properties || {};
          var popupContent = '<div style="font-family: Arial; font-size: 12px;">';
          popupContent += '<strong>Ueberschwemmungsgebiet Ahr</strong><br>';
          popupContent += '<em>Vorlaeufig sichergestellt (Par.76 Abs. 3 WHG)</em><br><br>';
          
          if (props.gewaesser || props.GEWAESSER) {
            popupContent += '<strong>Gewaesser:</strong> ' + (props.gewaesser || props.GEWAESSER) + '<br>';
          }
          if (props.hq || props.HQ) {
            popupContent += '<strong>Bemessungshochwasser:</strong> HQ' + (props.hq || props.HQ) + '<br>';
          }
          if (props.datum || props.DATUM) {
            popupContent += '<strong>Datum:</strong> ' + (props.datum || props.DATUM) + '<br>';
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
      console.error('[UESG] Fehler beim Laden der Daten:', error);
      console.log('[UESG] Verwende WMS-Fallback');
      
      // Fallback: WMS-Layer
      uesgLayer = L.tileLayer.wms('https://geodienste-wasser.rlp-umwelt.de/maps/uesg/wms', {
        layers: 'uesg:uesg_gesetzlich',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        crs: L.CRS.EPSG3857,
        attribution: '&copy; RLP-UMWELT Wasserportal',
        maxZoom: 20,
        opacity: 0.6
      });
      
      window.uesgAhrLayer = uesgLayer;
      allLayers.push(uesgLayer);
      addUESGToLegend(map);
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