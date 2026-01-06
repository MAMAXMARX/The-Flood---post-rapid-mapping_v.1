// ============================================
// AHRTAL FLUTKATASTROPHE - ZUSÄTZLICHE LAYER
// Luftbilder 2019/2021 & Überschwemmungsgebiet
// ============================================

/**
 * Lädt zusätzliche Kartenlayer für die Ahrtal-Flutkatastrophe:
 * - Luftbilder 2019 (vor der Flut)
 * - Luftbilder 2021 (nach der Flut) 
 * - Überschwemmungsgebiet (ÜSG) Ahr
 * 
 * Datenquellen:
 * - LVermGeo Rheinland-Pfalz (Open Data)
 * - Geoportal RLP / SGD Nord
 */

function loadAhrtalLayers(map, allLayers) {
  console.log('🌊 Lade Ahrtal-Layer (Luftbilder & Hochwasserlinie)...');
  
  // ============================================
  // LUFTBILDER 2019 (VOR DER FLUT)
  // ============================================
  
  // WMS Layer für Luftbilder 2019 (DOP20)
  var luftbild2019 = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop20',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '©GeoBasis-DE / LVermGeoRP 2019, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8,
    // Zeitfilter für 2019
    time: '2019'
  });
  
  // ============================================
  // LUFTBILDER 2021 (NACH DER FLUT)
  // ============================================
  
  // WMS Layer für Luftbilder September 2021 (nach der Flut)
  var luftbild2021 = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop_rgb',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '©GeoBasis-DE / LVermGeoRP 2021, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8,
    // Zeitfilter für 2021
    time: '2021'
  });
  
  // Alternative: Sonderbefliegung Hochwasser Ahr 2021 (DOP40)
  var luftbild2021_hochwasser = L.tileLayer.wms('https://www.geoportal.rlp.de/mapbender/php/wms.php', {
    layers: 'rp_dop40_hochwasser',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    crs: L.CRS.EPSG3857,
    attribution: '©GeoBasis-DE / LVermGeoRP 2021 - Sonderbefliegung Hochwasser, <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    maxZoom: 20,
    opacity: 0.8
  });
  
  // ============================================
  // ÜBERSCHWEMMUNGSGEBIET (ÜSG) AHR
  // ============================================
  
  // GeoJSON für das vorläufig sichergestellte Überschwemmungsgebiet
  // Quelle: Geoportal RLP / SGD Nord
  var uesgAhrLayer = null;
  
  // Lade ÜSG-Daten als GeoJSON
  fetch('https://www.geoportal.rlp.de/spatial-objects/325/collections/uesg:uesg_gesetzlich/items?f=json&limit=10000')
    .then(response => {
      if (!response.ok) {
        // Fallback: Verwende WFS-Service
        console.log('⚠️ GeoJSON API nicht verfügbar, verwende WFS...');
        return fetch('https://geodienste-wasser.rlp-umwelt.de/geoserver/uesg/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=uesg:uesg_gesetzlich&outputFormat=application/json&srsName=EPSG:4326');
      }
      return response;
    })
    .then(response => response.json())
    .then(data => {
      console.log('✅ ÜSG-Daten geladen:', data);
      
      // Filtere nur Ahr-Daten (falls mehrere Gewässer enthalten)
      var ahrFeatures = data.features ? data.features.filter(f => {
        var name = f.properties.gewaesser || f.properties.name || '';
        return name.toLowerCase().includes('ahr');
      }) : [];
      
      if (ahrFeatures.length === 0) {
        console.log('⚠️ Keine Ahr-spezifischen Daten gefunden, verwende alle Features');
        ahrFeatures = data.features || [];
      }
      
      // Erstelle GeoJSON Layer mit Stil
      uesgAhrLayer = L.geoJSON(ahrFeatures, {
        style: function(feature) {
          return {
            color: '#0066cc',        // Blau für Überschwemmungsgebiet
            weight: 2,
            opacity: 0.8,
            fillColor: '#0099ff',
            fillOpacity: 0.3,
            dashArray: '5, 5'
          };
        },
        onEachFeature: function(feature, layer) {
          // Popup mit Informationen
          var props = feature.properties || {};
          var popupContent = '<div style="font-family: Arial; font-size: 12px;">';
          popupContent += '<strong>Überschwemmungsgebiet Ahr</strong><br>';
          popupContent += '<em>Vorläufig sichergestellt (§76 Abs. 3 WHG)</em><br><br>';
          
          if (props.gewaesser) popupContent += '<strong>Gewässer:</strong> ' + props.gewaesser + '<br>';
          if (props.hq) popupContent += '<strong>Bemessungshochwasser:</strong> HQ' + props.hq + '<br>';
          if (props.datum) popupContent += '<strong>Datum:</strong> ' + props.datum + '<br>';
          
          popupContent += '<br><small>Datenquelle: <a href="https://sgdnord.rlp.de" target="_blank">SGD Nord RLP</a></small>';
          popupContent += '</div>';
          
          layer.bindPopup(popupContent);
        }
      });
      
      // Layer zur Karte hinzufügen (aber nicht sichtbar)
      allLayers.push(uesgAhrLayer);
      
      // Layer zur Legende hinzufügen
      addUESGToLegend(uesgAhrLayer, map);
      
      console.log('✅ Überschwemmungsgebiet Ahr geladen');
    })
    .catch(error => {
      console.error('❌ Fehler beim Laden der ÜSG-Daten:', error);
      console.log('ℹ️ Hinweis: ÜSG-Daten können möglicherweise nicht geladen werden.');
      console.log('   Alternative: Manuelle Integration über WMS-Layer');
      
      // Fallback: WMS-Layer für Überschwemmungsgebiete
      uesgAhrLayer = L.tileLayer.wms('https://geodienste-wasser.rlp-umwelt.de/maps/uesg/wms', {
        layers: 'uesg:uesg_gesetzlich',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        crs: L.CRS.EPSG3857,
        attribution: '© RLP-UMWELT Wasserportal',
        maxZoom: 20,
        opacity: 0.6,
        // CQL-Filter für Ahr (falls unterstützt)
        cql_filter: "gewaesser LIKE '%Ahr%'"
      });
      
      allLayers.push(uesgAhrLayer);
      addUESGToLegend(uesgAhrLayer, map);
    });
  
  // ============================================
  // LAYER ZU ARRAYS HINZUFÜGEN
  // ============================================
  
  allLayers.push(luftbild2019);
  allLayers.push(luftbild2021);
  allLayers.push(luftbild2021_hochwasser);
  
  // ============================================
  // LAYER ZUR BASISKARTEN-AUSWAHL HINZUFÜGEN
  // ============================================
  
  // Layer zur Basiskarten-Control (unten links) hinzufügen
  addAhrtalLayersToBaseControl(map, luftbild2019, luftbild2021, luftbild2021_hochwasser);
  
  console.log('✅ Ahrtal-Layer erfolgreich geladen');
}

// ============================================
// LAYER ZUR BASISKARTEN-CONTROL HINZUFÜGEN
// ============================================

function addAhrtalLayersToBaseControl(map, luftbild2019, luftbild2021, luftbild2021_hochwasser) {
  // Finde das existierende Layer Control
  map.eachLayer(function(layer) {
    if (layer instanceof L.Control.Layers) {
      // Füge Luftbild-Layer als Basis-Layers hinzu
      layer.addBaseLayer(luftbild2019, "🌍 Luftbild 2019 (vor Flut)");
      layer.addBaseLayer(luftbild2021, "🌍 Luftbild 2021 (nach Flut)");
      layer.addBaseLayer(luftbild2021_hochwasser, "🌍 Luftbild 2021 (Sonderbefliegung)");
    }
  });
  
  // Alternative: Direkt das Layer Control aktualisieren
  setTimeout(function() {
    var layerControl = document.querySelector('.leaflet-control-layers');
    if (layerControl) {
      console.log('✅ Luftbild-Layer zur Basiskarten-Auswahl hinzugefügt');
    }
  }, 500);
}

// ============================================
// ÜSG-LAYER ZUR RECHTEN LEGENDE HINZUFÜGEN
// ============================================

function addUESGToLegend(uesgLayer, map) {
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (!legendControl) {
      console.warn('⚠️ Keine Legende gefunden');
      return;
    }
    
    // Erstelle neue Sektion für Überschwemmungsgebiet
    var uesgSection = document.createElement('div');
    uesgSection.className = 'legend-date-section';
    uesgSection.innerHTML = `
      <div class="legend-date-header" onclick="toggleUESGSection()" style="background: #e3f2fd;">
        <span class="section-toggle-icon" id="uesg-toggle">▼</span>
        <div class="date-header-content">
          <strong style="color: #0066cc;">🌊 Überschwemmungsgebiet Ahr</strong>
          <small style="color: #0066cc;">Vorläufig sichergestellt (§76 Abs. 3 WHG)</small>
        </div>
      </div>
      <div class="legend-date-content" id="uesg-content">
        <div class="legend-item-compact">
          <input type="checkbox" id="uesg-toggle-checkbox" onchange="toggleUESGLayer()">
          <label for="uesg-toggle-checkbox" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <span class="legend-symbol-small" style="background: linear-gradient(135deg, #0099ff 0%, #0066cc 100%); border: 2px solid #0066cc;"></span>
            <span class="layer-name">Hochwasserlinie 2021</span>
          </label>
        </div>
        <div style="margin-top: 8px; padding: 6px; background: #f5f5f5; border-radius: 4px; font-size: 10px; color: #555;">
          <strong>ℹ️ Hinweis:</strong><br>
          Zeigt die vorläufig sichergestellte Überschwemmungsfläche der Ahrtal-Flut vom Juli 2021.<br><br>
          <strong>Datenquelle:</strong> <a href="https://sgdnord.rlp.de" target="_blank" style="color: #0066cc;">SGD Nord RLP</a> / 
          <a href="https://www.geoportal.rlp.de" target="_blank" style="color: #0066cc;">Geoportal RLP</a>
        </div>
      </div>
    `;
    
    // Füge die Sektion am Anfang der Legende ein
    var firstSection = legendControl.querySelector('.legend-date-section');
    if (firstSection) {
      legendControl.insertBefore(uesgSection, firstSection);
    } else {
      legendControl.appendChild(uesgSection);
    }
    
    // Speichere Layer-Referenz global für Toggle-Funktion
    window.uesgAhrLayerRef = uesgLayer;
    window.mapRef = map;
    
    console.log('✅ ÜSG-Layer zur Legende hinzugefügt');
  }, 600);
}

// ============================================
// TOGGLE-FUNKTIONEN FÜR ÜSG-LAYER
// ============================================

function toggleUESGSection() {
  var content = document.getElementById('uesg-content');
  var icon = document.getElementById('uesg-toggle');
  
  if (content && icon) {
    if (content.style.display === 'none') {
      content.style.display = 'block';
      icon.textContent = '▼';
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
    }
  }
}

function toggleUESGLayer() {
  var checkbox = document.getElementById('uesg-toggle-checkbox');
  var layer = window.uesgAhrLayerRef;
  var map = window.mapRef;
  
  if (!layer || !map) {
    console.warn('⚠️ ÜSG-Layer oder Karte nicht verfügbar');
    return;
  }
  
  if (checkbox && checkbox.checked) {
    map.addLayer(layer);
    console.log('✅ ÜSG-Layer eingeblendet');
  } else {
    map.removeLayer(layer);
    console.log('✅ ÜSG-Layer ausgeblendet');
  }
}

// ============================================
// INFO-FENSTER MIT ANLEITUNG
// ============================================

function showAhrtalLayerInfo() {
  var infoHTML = `
    <div style="font-family: Arial; padding: 15px; max-width: 500px;">
      <h3 style="margin-top: 0; color: #0066cc;">🌊 Ahrtal-Flutkatastrophe Layer</h3>
      
      <h4>📸 Luftbilder</h4>
      <p>Unter <strong>"Kartenansicht"</strong> (unten links) können Sie zwischen verschiedenen Luftbildern wählen:</p>
      <ul>
        <li><strong>Luftbild 2019</strong> - Zustand vor der Flut</li>
        <li><strong>Luftbild 2021</strong> - Zustand nach der Flut (September 2021)</li>
        <li><strong>Sonderbefliegung 2021</strong> - Spezielle Aufnahmen der betroffenen Gebiete</li>
      </ul>
      
      <h4>🌊 Überschwemmungsgebiet</h4>
      <p>Die <strong>Hochwasserlinie</strong> können Sie in der Legende rechts ein- und ausblenden.</p>
      <p><em>Zeigt die vorläufig sichergestellte Überschwemmungsfläche gemäß §76 Abs. 3 WHG.</em></p>
      
      <h4>📊 Datenquellen</h4>
      <ul style="font-size: 12px;">
        <li>Luftbilder: LVermGeo Rheinland-Pfalz (Open Data)</li>
        <li>Überschwemmungsgebiet: SGD Nord / Geoportal RLP</li>
      </ul>
      
      <p style="font-size: 11px; color: #666; margin-top: 15px;">
        <strong>Lizenz:</strong> Datenlizenz Deutschland - Namensnennung - Version 2.0<br>
        <a href="https://www.govdata.de/dl-de/by-2-0" target="_blank">https://www.govdata.de/dl-de/by-2-0</a>
      </p>
    </div>
  `;
  
  alert(infoHTML); // Kann später durch ein schöneres Modal ersetzt werden
}

// ============================================
// AUTOMATISCHER AUFRUF
// ============================================

// Exportiere die Hauptfunktion für die Verwendung in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAhrtalLayers };
}
