document.addEventListener('DOMContentLoaded', function () {
  
  // ============================================
  // NEUE STARTKOORDINATEN & ZOOM
  // ============================================
  var map = L.map('map').setView([50.47296726489117, 6.954176637076611], 12);

  // ============================================
  // VERSCHIEDENE KARTENANSICHTEN (BASE LAYERS)
  // ============================================
  
  // OpenStreetMap (Standard)
  var osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  // OpenStreetMap Humanitarian (bessere Sichtbarkeit bei Katastrophen)
  var osmHumanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    maxZoom: 19
  });

  // Esri World Imagery (Satellit - aktuellste verfügbare Aufnahmen)
  var esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  });

  // Google Satellite (Alternative)
  var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google'
  });

  // CartoDB Voyager (schöne Übersichtskarte)
  var cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  });

  // ============================================
  // SENTINEL-2 CLOUDLESS (Mai 2020 - April 2021)
  // ============================================
  
  // WICHTIG: Dieses Mosaik zeigt den Zustand VOR der Flut (Mai 2020 - April 2021)
  var sentinel2_2021 = L.tileLayer(
    'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg',
    {
      attribution: '&copy; <a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless</a> by <a href="https://eox.at" target="_blank">EOX</a> (Modified Copernicus Sentinel data 2020-2021)',
      maxZoom: 18,
      minZoom: 0
    }
  );

  // ============================================
  // HÖHENLINIEN WMS (GeoPortal RLP)
  // ============================================
  
  // Höhenlinien von GeoPortal RLP über Proxy laden
  var hoehenlinien = L.tileLayer.wms('/api/proxy/wms', {
    layers: 'rp_hoeli',  // Höhenlinien RP Layer
    format: 'image/png',
    transparent: true,
    attribution: '© <a href="https://lvermgeo.rlp.de">LVermGeo RLP</a> - ATKIS-DGM',
    minZoom: 0,
    maxZoom: 18
  });

  // Speichere Höhenlinien global für Legende
  window.hoehenlinienLayer = hoehenlinien;

  // Standard-Karte beim Start anzeigen
  osmStandard.addTo(map);

  // Array für alle Layer
  var allLayers = [];

  // ============================================
  // BASE LAYER CONTROL (Kartenauswahl)
  // ============================================
  
  var baseMaps = {
    "OpenStreetMap": osmStandard,
    "Humanitarian": osmHumanitarian,
    "Satellit (Esri)": esriSatellite,
    "Google Satellit": googleSatellite,
    "CartoDB Voyager": cartoVoyager,
    "Sentinel-2 (2020-2021)": sentinel2_2021
  };

  var overlayMaps = {
    "Höhenlinien": hoehenlinien
  };

  // Standard Layer Control für Basiskarten hinzufügen (unten links)
  var layerControl = L.control.layers(baseMaps, overlayMaps, {
    position: 'bottomleft',
    collapsed: false
  }).addTo(map);
  
  // Speichere Layer Control global für Ahrtal-Layer
  window.globalLayerControl = layerControl;
  
  // Ermögliche Toggle auf Layer-Namen klicken (Höhenlinien und andere Overlay-Layer)
  setTimeout(function() {
    var layerLabels = document.querySelectorAll('.leaflet-control-layers-overlays label');
    layerLabels.forEach(function(label) {
      label.style.cursor = 'pointer';
      label.addEventListener('click', function(e) {
        // Nur toggle wenn nicht direkt auf Checkbox geklickt
        if (e.target.tagName !== 'INPUT') {
          var checkbox = this.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
          }
        }
      });
    });
  }, 100);
  
  // ============================================
  // TOGGLE BASE LAYER ZUM AUSBLENDEN
  // ============================================
  
  // Tracke den aktuell aktiven Base-Layer
  var lastSelectedBaseLayer = osmStandard;
  
  // Event-Listener für Base-Layer Clicks
  setTimeout(function() {
    var baseLayerLabels = document.querySelectorAll('.leaflet-control-layers-base label');
    baseLayerLabels.forEach(function(label) {
      label.addEventListener('click', function(e) {
        var checkbox = this.querySelector('input[type="radio"]');
        if (!checkbox) return;
        
        // Finde welcher Layer das ist
        var layerName = label.innerText.trim();
        var selectedLayer = baseMaps[layerName];
        
        if (!selectedLayer) return;
        
        // Wenn derselbe Layer nochmal geklickt wird, entferne ihn
        if (lastSelectedBaseLayer === selectedLayer && map.hasLayer(selectedLayer)) {
          map.removeLayer(selectedLayer);
          checkbox.checked = false;
          lastSelectedBaseLayer = null;
        } else {
          // Sonst wechsle normal zum neuen Layer
          lastSelectedBaseLayer = selectedLayer;
        }
      });
    });
  }, 100);
  
  // ============================================
  // MONOCHROME FILTER IN LAYER CONTROL EINFÜGEN
  // ============================================
  
  // Warte bis Layer Control im DOM ist
  setTimeout(function() {
    var layerControlContainer = document.querySelector('.leaflet-control-layers-base');
    if (layerControlContainer) {
      // Erstelle Separator
      var separator = document.createElement('div');
      separator.className = 'leaflet-control-layers-separator';
      
      // Erstelle Monochrome Filter Option
      var filterDiv = document.createElement('label');
      filterDiv.style.display = 'flex';
      filterDiv.style.alignItems = 'center';
      filterDiv.style.gap = '6px';
      filterDiv.style.padding = '4px 0';
      filterDiv.style.cursor = 'pointer';
      filterDiv.style.fontSize = '12px';
      filterDiv.style.marginTop = '8px';
      
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'monochromeToggle';
      checkbox.style.cursor = 'pointer';
      checkbox.style.width = '14px';
      checkbox.style.height = '14px';
      checkbox.style.margin = '0';
      
      var label = document.createElement('span');
      label.textContent = 'Monochrome Filter';
      label.style.fontWeight = '500';
      
      filterDiv.appendChild(checkbox);
      filterDiv.appendChild(label);
      
      // Füge nach der Base-Layer-Sektion ein
      layerControlContainer.parentNode.insertBefore(separator, layerControlContainer.nextSibling);
      layerControlContainer.parentNode.insertBefore(filterDiv, separator.nextSibling);
      
      // Event Listener für Monochrome Toggle
      var mapElement = document.getElementById('map');
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          mapElement.classList.add('monochrome');
          console.log('✓ Monochrome Filter aktiviert');
        } else {
          mapElement.classList.remove('monochrome');
          console.log('✓ Monochrome Filter deaktiviert');
        }
      });
    }
  }, 100);

  // ============================================
  // RAPID MAPPING DATEN LADEN
  // ============================================
  
  // Custom Layer Control erstellen (muss ZUERST erfolgen)
  createCustomLayerControl(map);
  
  // Funktion aus RM11.08.21.js aufrufen
  loadRapidMappingData(map, allLayers);
  
  // Funktion aus RM19.07.21.js aufrufen
  loadRapidMappingData_19_07(map, allLayers);
  
  // 19.07 Daten zur Legende hinzufügen
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (legendControl) {
      addLayerControl_19_07_ToExisting(legendControl, map);
    }
  }, 300);
  
  // ============================================
  // NEU: AHRTAL LAYER LADEN (Hochwasserlinie)
  // ============================================
  
  // Lade Ahrtal-Layer aus Layer.js
  if (typeof loadAhrtalLayers === 'function') {
    setTimeout(function() {
      loadAhrtalLayers(map, allLayers);
      console.log('✅ Ahrtal-Layer (Hochwasserlinie) wird geladen...');
    }, 500);
  } else {
    console.warn('⚠️ loadAhrtalLayers Funktion nicht gefunden - Layer.js geladen?');
  }

  // Karte nach kurzer Verzögerung neu rendern
  setTimeout(function() { 
    map.invalidateSize(); 
  }, 100);
  
  // ============================================
  // CLIENT-SIDE SVG EXPORT (KEIN BACKEND NÖTIG!)
  // ============================================
  
  // Erstelle Custom SVG Export Button
  var SvgExportControl = L.Control.extend({
    options: {
      position: 'topleft'
    },
    
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom-svg-export');
      
      var button = L.DomUtil.create('a', 'leaflet-control-svg-export-button', container);
      button.href = '#';
      button.title = 'Sichtbare Layer als SVG exportieren';
      button.innerHTML = '📥'; // Download Icon
      button.style.fontSize = '18px';
      button.style.width = '30px';
      button.style.height = '30px';
      button.style.lineHeight = '30px';
      button.style.textAlign = 'center';
      button.style.display = 'block';
      button.style.backgroundColor = 'white';
      button.style.color = 'black';
      button.style.textDecoration = 'none';
      
      L.DomEvent.on(button, 'click', function(e) {
        L.DomEvent.preventDefault(e);
        exportVisibleLayersAsSVG(map);
      });
      
      return container;
    }
  });
  
  map.addControl(new SvgExportControl());
  
  console.log('✓ Karte geladen - Monochrome Filter & SVG Export (client-side) verfügbar');
  console.log('🌊 Ahrtal-Layer-Integration aktiviert');
  console.log('🗺️ Neue Startkoordinaten: 50.473°N, 6.954°E @ Zoom 12');
});

// ============================================
// CLIENT-SIDE SVG EXPORT FUNKTIONEN
// ============================================

function exportVisibleLayersAsSVG(map) {
  console.log('🔄 Sammle sichtbare Layer für SVG-Export...');
  
  // Sammle alle sichtbaren GeoJSON Layer
  var visibleLayers = [];
  
  // Durchlaufe alle Layer auf der Karte
  map.eachLayer(function(layer) {
    // Prüfe ob es ein GeoJSON Layer ist
    if (layer.toGeoJSON && typeof layer.toGeoJSON === 'function') {
      try {
        var geojson = layer.toGeoJSON();
        
        // Extrahiere Style-Informationen
        var style = {
          color: layer.options.color || '#000000',
          weight: layer.options.weight || 1,
          opacity: layer.options.opacity || 1,
          fillColor: layer.options.fillColor || layer.options.color || '#cccccc',
          fillOpacity: layer.options.fillOpacity || 0.3,
          dashArray: layer.options.dashArray || null
        };
        
        visibleLayers.push({
          geojson: geojson,
          style: style,
          name: layer.options.layerName || 'Unnamed Layer'
        });
      } catch (e) {
        console.warn('Layer konnte nicht exportiert werden:', e);
      }
    }
  });
  
  console.log('✓ ' + visibleLayers.length + ' sichtbare Layer gefunden');
  
  if (visibleLayers.length === 0) {
    alert('Keine exportierbaren Layer sichtbar. Bitte aktiviere Layer in der Legende.');
    return;
  }
  
  // Hole aktuelle Kartenansicht
  var bounds = map.getBounds();
  var zoom = map.getZoom();
  
  // Generiere SVG direkt im Browser
  var svgContent = generateSVGFromLayers(visibleLayers, bounds, zoom);
  
  // Download SVG
  downloadSVG(svgContent);
}

function generateSVGFromLayers(layers, bounds, zoom) {
  // Extrahiere Bounds
  var minLat = bounds.getSouth();
  var maxLat = bounds.getNorth();
  var minLon = bounds.getWest();
  var maxLon = bounds.getEast();
  
  // Berechne Mittelpunkt für Aspect Ratio Korrektur
  var centerLat = (minLat + maxLat) / 2;
  var centerLatRad = centerLat * Math.PI / 180;
  var aspectRatio = Math.cos(centerLatRad);
  
  // SVG Dimensionen
  var svgWidth = 2000;
  var svgHeight = 2000;
  var padding = 50;
  
  // Berechne Skalierung mit Aspect Ratio Korrektur
  var lonRange = maxLon - minLon;
  var latRange = maxLat - minLat;
  var correctedLonRange = lonRange * aspectRatio;
  
  var scaleLon = (svgWidth - 2 * padding) / correctedLonRange;
  var scaleLat = (svgHeight - 2 * padding) / latRange;
  var scale = Math.min(scaleLon, scaleLat);
  
  // Koordinaten-Konvertierung
  function coordToSVG(lon, lat) {
    var x = (lon - minLon) * aspectRatio * scale + padding;
    var y = svgHeight - ((lat - minLat) * scale + padding);
    return { x: x, y: y };
  }
  
  // Sammle alle SVG Pfade
  var svgPaths = [];
  
  layers.forEach(function(layer, layerIdx) {
    var geojson = layer.geojson;
    var style = layer.style;
    
    // Extrahiere Features
    var features = [];
    if (geojson.type === 'FeatureCollection') {
      features = geojson.features || [];
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    } else {
      features = [{ type: 'Feature', geometry: geojson, properties: {} }];
    }
    
    features.forEach(function(feature, featureIdx) {
      var geometry = feature.geometry || {};
      var geomType = geometry.type || '';
      var coords = geometry.coordinates || [];
      
      var pathId = 'layer' + layerIdx + '_feature' + featureIdx;
      
      if (geomType === 'Polygon') {
        svgPaths.push(createPolygonPath(coords, style, pathId, coordToSVG));
      } else if (geomType === 'MultiPolygon') {
        coords.forEach(function(polygon, polyIdx) {
          svgPaths.push(createPolygonPath(polygon, style, pathId + '_poly' + polyIdx, coordToSVG));
        });
      } else if (geomType === 'LineString') {
        svgPaths.push(createLinePath(coords, style, pathId, coordToSVG));
      } else if (geomType === 'MultiLineString') {
        coords.forEach(function(line, lineIdx) {
          svgPaths.push(createLinePath(line, style, pathId + '_line' + lineIdx, coordToSVG));
        });
      } else if (geomType === 'Point') {
        svgPaths.push(createPointMarker(coords, style, pathId, coordToSVG));
      } else if (geomType === 'MultiPoint') {
        coords.forEach(function(point, ptIdx) {
          svgPaths.push(createPointMarker(point, style, pathId + '_pt' + ptIdx, coordToSVG));
        });
      }
    });
  });
  
  // Aktuelles Datum
  var now = new Date();
  var dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE');
  
  // Generiere finales SVG
  var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + svgHeight + '" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">\n';
  svg += '  <title>EMSR517 AOI15 - Rapid Mapping Export</title>\n';
  svg += '  <defs>\n';
  svg += '    <style>\n';
  svg += '      text { font-family: Arial, sans-serif; fill: #333; }\n';
  svg += '    </style>\n';
  svg += '  </defs>\n';
  svg += '  \n';
  svg += '  <!-- Hintergrund -->\n';
  svg += '  <rect width="' + svgWidth + '" height="' + svgHeight + '" fill="#f5f5f5"/>\n';
  svg += '  \n';
  svg += '  <!-- Layer -->\n';
  svg += svgPaths.join('\n');
  svg += '  \n';
  svg += '  <!-- Titel -->\n';
  svg += '  <text x="' + (svgWidth/2) + '" y="30" text-anchor="middle" font-weight="bold" font-size="20">\n';
  svg += '    EMSR517 AOI15 - Ahrtal Flutkatastrophe\n';
  svg += '  </text>\n';
  svg += '  <text x="' + (svgWidth/2) + '" y="55" text-anchor="middle" font-size="14" fill="#666">\n';
  svg += '    CEMS Rapid Mapping - Export ' + dateStr + '\n';
  svg += '  </text>\n';
  svg += '  \n';
  svg += '  <!-- Koordinaten-Info -->\n';
  svg += '  <text x="10" y="' + (svgHeight - 30) + '" font-size="12" fill="#888">\n';
  svg += '    Koordinaten: ' + minLon.toFixed(4) + '°, ' + minLat.toFixed(4) + '° bis ' + maxLon.toFixed(4) + '°, ' + maxLat.toFixed(4) + '°\n';
  svg += '  </text>\n';
  svg += '  <text x="10" y="' + (svgHeight - 10) + '" font-size="12" fill="#888">\n';
  svg += '    Zoom: ' + zoom + ' | Layer: ' + layers.length + ' | Aspect Ratio: ' + aspectRatio.toFixed(4) + '\n';
  svg += '  </text>\n';
  svg += '</svg>';
  
  return svg;
}

function createPolygonPath(coords, style, pathId, coordToSVG) {
  var pathData = [];
  
  // Äußerer Ring
  var outerRing = coords[0];
  outerRing.forEach(function(coord, i) {
    var pt = coordToSVG(coord[0], coord[1]);
    if (i === 0) {
      pathData.push('M ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
    } else {
      pathData.push('L ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
    }
  });
  pathData.push('Z');
  
  // Innere Ringe (Löcher)
  for (var h = 1; h < coords.length; h++) {
    coords[h].forEach(function(coord, i) {
      var pt = coordToSVG(coord[0], coord[1]);
      if (i === 0) {
        pathData.push('M ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
      } else {
        pathData.push('L ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
      }
    });
    pathData.push('Z');
  }
  
  var pathStr = pathData.join(' ');
  var dashAttr = style.dashArray ? 'stroke-dasharray="' + style.dashArray + '"' : '';
  
  return '  <path id="' + pathId + '" d="' + pathStr + '" ' +
         'fill="' + style.fillColor + '" fill-opacity="' + style.fillOpacity + '" ' +
         'stroke="' + style.color + '" stroke-width="' + style.weight + '" ' +
         'stroke-opacity="' + style.opacity + '" ' + dashAttr + ' ' +
         'stroke-linejoin="round" stroke-linecap="round" />';
}

function createLinePath(coords, style, pathId, coordToSVG) {
  var pathData = [];
  
  coords.forEach(function(coord, i) {
    var pt = coordToSVG(coord[0], coord[1]);
    if (i === 0) {
      pathData.push('M ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
    } else {
      pathData.push('L ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
    }
  });
  
  var pathStr = pathData.join(' ');
  var dashAttr = style.dashArray ? 'stroke-dasharray="' + style.dashArray + '"' : '';
  
  return '  <path id="' + pathId + '" d="' + pathStr + '" fill="none" ' +
         'stroke="' + style.color + '" stroke-width="' + style.weight + '" ' +
         'stroke-opacity="' + style.opacity + '" ' + dashAttr + ' ' +
         'stroke-linecap="round" stroke-linejoin="round" />';
}

function createPointMarker(coords, style, pathId, coordToSVG) {
  var pt = coordToSVG(coords[0], coords[1]);
  var radius = 4;
  
  return '  <circle id="' + pathId + '" cx="' + pt.x.toFixed(2) + '" cy="' + pt.y.toFixed(2) + '" ' +
         'r="' + radius + '" fill="' + style.fillColor + '" fill-opacity="' + style.fillOpacity + '" ' +
         'stroke="' + style.color + '" stroke-width="' + style.weight + '" />';
}

function downloadSVG(svgContent) {
  var now = new Date();
  var filename = 'EMSR517_AOI15_Export_' + 
                 now.getFullYear() + 
                 ('0' + (now.getMonth() + 1)).slice(-2) + 
                 ('0' + now.getDate()).slice(-2) + '_' +
                 ('0' + now.getHours()).slice(-2) + 
                 ('0' + now.getMinutes()).slice(-2) + 
                 ('0' + now.getSeconds()).slice(-2) + 
                 '.svg';
  
  var blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  console.log('✅ SVG erfolgreich exportiert: ' + filename);
}