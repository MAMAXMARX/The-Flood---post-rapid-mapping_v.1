document.addEventListener('DOMContentLoaded', function () {
  
  // Neue Koordinaten & Zoom 15 - Zoom Control deaktiviert
  var map = L.map('map', {
    zoomControl: false  // ✅ Zoom Control entfernt
  }).setView([50.47296726489117, 6.954176637076611], 15);

  // ============================================
  // VERSCHIEDENE KARTENANSICHTEN (BASE LAYERS)
  // ============================================
  
  var osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  var osmHumanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    maxZoom: 19
  });

  var esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  });

  var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google'
  });

  var cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  esriSatellite.addTo(map);
  var allLayers = [];

  var baseMaps = {
    "OpenStreetMap": osmStandard,
    "Humanitarian": osmHumanitarian,
    "Satellit (Esri)": esriSatellite,
    "Google Satellit": googleSatellite,
    "CartoDB Voyager": cartoVoyager
  };

  var overlayMaps = {};

  var layerControl = L.control.layers(baseMaps, overlayMaps, {
    position: 'bottomleft',
    collapsed: false
  }).addTo(map);
  
  window.globalLayerControl = layerControl;
  var lastSelectedBaseLayer = esriSatellite;
  
  setTimeout(function() {
    var baseLayerLabels = document.querySelectorAll('.leaflet-control-layers-base label');
    baseLayerLabels.forEach(function(label) {
      label.addEventListener('click', function(e) {
        var checkbox = this.querySelector('input[type="radio"]');
        if (!checkbox) return;
        var layerName = label.innerText.trim();
        var selectedLayer = baseMaps[layerName];
        if (!selectedLayer) return;
        if (lastSelectedBaseLayer === selectedLayer && map.hasLayer(selectedLayer)) {
          map.removeLayer(selectedLayer);
          checkbox.checked = false;
          lastSelectedBaseLayer = null;
        } else {
          lastSelectedBaseLayer = selectedLayer;
        }
      });
    });
  }, 100);
  
  setTimeout(function() {
    var layerControlContainer = document.querySelector('.leaflet-control-layers-base');
    if (layerControlContainer) {
      var separator = document.createElement('div');
      separator.className = 'leaflet-control-layers-separator';
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
      checkbox.checked = true;
      checkbox.style.cursor = 'pointer';
      checkbox.style.width = '14px';
      checkbox.style.height = '14px';
      checkbox.style.margin = '0';
      var label = document.createElement('span');
      label.textContent = 'Monochrome Filter';
      label.style.fontWeight = '500';
      filterDiv.appendChild(checkbox);
      filterDiv.appendChild(label);
      layerControlContainer.parentNode.insertBefore(separator, layerControlContainer.nextSibling);
      layerControlContainer.parentNode.insertBefore(filterDiv, separator.nextSibling);
      var mapElement = document.getElementById('map');
      mapElement.classList.add('monochrome');
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          mapElement.classList.add('monochrome');
        } else {
          mapElement.classList.remove('monochrome');
        }
      });
    }
  }, 100);

  createCustomLayerControl(map);
  loadRapidMappingData(map, allLayers);
  loadRapidMappingData_19_07(map, allLayers);
  
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (legendControl) {
      addLayerControl_19_07_ToExisting(legendControl, map);
    }
  }, 300);
  
  if (typeof loadAhrtalLayers === 'function') {
    setTimeout(function() {
      loadAhrtalLayers(map, allLayers);
    }, 500);
  }

  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (legendControl) {
      var toggleButton = document.createElement('button');
      toggleButton.innerHTML = '◀';
      toggleButton.className = 'legend-toggle-button';
      toggleButton.title = 'Legende ein-/ausblenden';
      toggleButton.style.cssText = 'position:absolute;left:-30px;top:10px;width:28px;height:28px;background:white;border:none;border-radius:4px 0 0 4px;box-shadow:-2px 2px 6px rgba(0,0,0,0.3);cursor:pointer;font-size:16px;font-weight:bold;color:#333;z-index:1000;';
      legendControl.style.position = 'relative';
      legendControl.appendChild(toggleButton);
      var isVisible = true;
      toggleButton.addEventListener('click', function() {
        if (isVisible) {
          legendControl.style.transform = 'translateX(100%)';
          legendControl.style.opacity = '0';
          toggleButton.style.left = '-40px';
          toggleButton.innerHTML = '▶';
          isVisible = false;
        } else {
          legendControl.style.transform = 'translateX(0)';
          legendControl.style.opacity = '1';
          toggleButton.style.left = '-30px';
          toggleButton.innerHTML = '◀';
          isVisible = true;
        }
      });
      legendControl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }
  }, 600);

  setTimeout(function() { map.invalidateSize(); }, 100);
  
  // ============================================
  // DYNAMISCHE HÖHE FÜR CUSTOM LAYER CONTROL
  // Verhindert Überlappung mit Leaflet Control
  // ============================================
  
  setTimeout(function() {
    var customControl = document.querySelector('.custom-layer-control');
    var leafletControl = document.querySelector('.leaflet-control-layers');
    
    if (customControl && leafletControl) {
      function updateMaxHeight() {
        var leafletRect = leafletControl.getBoundingClientRect();
        var customRect = customControl.getBoundingClientRect();
        
        // Berechne maximale Höhe: Abstand vom Top bis zum Start des Leaflet Controls
        var maxHeight = leafletRect.top - customRect.top - 20; // 20px Abstand
        
        if (maxHeight > 200) { // Mindesthöhe
          customControl.style.maxHeight = maxHeight + 'px';
        }
        
        // Debug: Überprüfe Alignment
        console.log('Custom Control left:', customRect.left);
        console.log('Leaflet Control left:', leafletRect.left);
        console.log('Gap:', leafletRect.top - (customRect.top + customRect.height));
      }
      
      updateMaxHeight();
      window.addEventListener('resize', updateMaxHeight);
      
      console.log('✅ Dynamische Höhenberechnung aktiviert (20px Gap)');
    }
  }, 1000);
  
  // ============================================
  // ORTSCHAFTEN CONTROL (RECHTE SEITE)
  // ============================================
  
  if (typeof createOrtschaftenControl === 'function') {
    createOrtschaftenControl(map);
  }
  
  // ============================================
  // SVG EXPORT - Funktionen bleiben verfügbar
  // Button wurde entfernt aus Interface
  // ============================================
  
  console.log('✓ Karte geladen mit allen Features');
  console.log('🎨 Esri Satellit & Monochrome aktiv');
  console.log('📖 Legende ein-/ausblendbar');
  console.log('📍 Ortschaften-Navigation rechts');
  console.log('🚫 Zoom Control & SVG Export Button entfernt');
});

function exportVisibleLayersAsSVG(map) {
  console.log('🔄 Sammle sichtbare Layer...');
  var visibleLayers = [];
  map.eachLayer(function(layer) {
    if (layer.toGeoJSON && typeof layer.toGeoJSON === 'function') {
      try {
        var geojson = layer.toGeoJSON();
        var style = {
          color: layer.options.color || '#000000',
          weight: layer.options.weight || 1,
          opacity: layer.options.opacity || 1,
          fillColor: layer.options.fillColor || layer.options.color || '#cccccc',
          fillOpacity: layer.options.fillOpacity || 0.3,
          dashArray: layer.options.dashArray || null
        };
        visibleLayers.push({ geojson: geojson, style: style, name: layer.options.layerName || 'Layer' });
      } catch (e) {}
    }
  });
  
  if (visibleLayers.length === 0) {
    alert('Keine exportierbaren Layer sichtbar.');
    return;
  }
  
  var bounds = map.getBounds();
  var svgContent = generateSVGFromLayers(visibleLayers, bounds, map.getZoom());
  downloadSVG(svgContent);
}

function generateSVGFromLayers(layers, bounds, zoom) {
  var minLat = bounds.getSouth();
  var maxLat = bounds.getNorth();
  var minLon = bounds.getWest();
  var maxLon = bounds.getEast();
  var centerLat = (minLat + maxLat) / 2;
  var aspectRatio = Math.cos(centerLat * Math.PI / 180);
  var svgWidth = 2000, svgHeight = 2000, padding = 50;
  var lonRange = maxLon - minLon;
  var latRange = maxLat - minLat;
  var correctedLonRange = lonRange * aspectRatio;
  var scaleLon = (svgWidth - 2 * padding) / correctedLonRange;
  var scaleLat = (svgHeight - 2 * padding) / latRange;
  var scale = Math.min(scaleLon, scaleLat);
  
  function coordToSVG(lon, lat) {
    var x = (lon - minLon) * aspectRatio * scale + padding;
    var y = svgHeight - ((lat - minLat) * scale + padding);
    return { x: x, y: y };
  }
  
  var svgPaths = [];
  layers.forEach(function(layer, layerIdx) {
    var geojson = layer.geojson;
    var style = layer.style;
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
  
  var now = new Date();
  var dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE');
  var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + svgHeight + '" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">\n';
  svg += '  <rect width="' + svgWidth + '" height="' + svgHeight + '" fill="#f5f5f5"/>\n';
  svg += svgPaths.join('\n');
  svg += '  <text x="' + (svgWidth/2) + '" y="30" text-anchor="middle" font-weight="bold" font-size="20" font-family="Arial">EMSR517 AOI15 - Ahrtal</text>\n';
  svg += '  <text x="' + (svgWidth/2) + '" y="55" text-anchor="middle" font-size="14" fill="#666" font-family="Arial">Export ' + dateStr + '</text>\n';
  svg += '</svg>';
  return svg;
}

function createPolygonPath(coords, style, pathId, coordToSVG) {
  var pathData = [];
  var outerRing = coords[0];
  outerRing.forEach(function(coord, i) {
    var pt = coordToSVG(coord[0], coord[1]);
    pathData.push((i === 0 ? 'M ' : 'L ') + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
  });
  pathData.push('Z');
  for (var h = 1; h < coords.length; h++) {
    coords[h].forEach(function(coord, i) {
      var pt = coordToSVG(coord[0], coord[1]);
      pathData.push((i === 0 ? 'M ' : 'L ') + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
    });
    pathData.push('Z');
  }
  var dashAttr = style.dashArray ? 'stroke-dasharray="' + style.dashArray + '"' : '';
  return '  <path id="' + pathId + '" d="' + pathData.join(' ') + '" fill="' + style.fillColor + '" fill-opacity="' + style.fillOpacity + '" stroke="' + style.color + '" stroke-width="' + style.weight + '" stroke-opacity="' + style.opacity + '" ' + dashAttr + ' stroke-linejoin="round" stroke-linecap="round" />';
}

function createLinePath(coords, style, pathId, coordToSVG) {
  var pathData = [];
  coords.forEach(function(coord, i) {
    var pt = coordToSVG(coord[0], coord[1]);
    pathData.push((i === 0 ? 'M ' : 'L ') + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2));
  });
  var dashAttr = style.dashArray ? 'stroke-dasharray="' + style.dashArray + '"' : '';
  return '  <path id="' + pathId + '" d="' + pathData.join(' ') + '" fill="none" stroke="' + style.color + '" stroke-width="' + style.weight + '" stroke-opacity="' + style.opacity + '" ' + dashAttr + ' stroke-linecap="round" stroke-linejoin="round" />';
}

function createPointMarker(coords, style, pathId, coordToSVG) {
  var pt = coordToSVG(coords[0], coords[1]);
  return '  <circle id="' + pathId + '" cx="' + pt.x.toFixed(2) + '" cy="' + pt.y.toFixed(2) + '" r="4" fill="' + style.fillColor + '" fill-opacity="' + style.fillOpacity + '" stroke="' + style.color + '" stroke-width="' + style.weight + '" />';
}

function downloadSVG(svgContent) {
  var now = new Date();
  var filename = 'EMSR517_AOI15_' + now.getFullYear() + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + '_' + ('0' + now.getHours()).slice(-2) + ('0' + now.getMinutes()).slice(-2) + '.svg';
  var blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('✅ SVG exportiert: ' + filename);
}