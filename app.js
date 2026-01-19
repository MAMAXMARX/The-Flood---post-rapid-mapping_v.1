document.addEventListener('DOMContentLoaded', function () {
  
  // ✅ ÄNDERUNG 1: Neue Koordinaten & Zoom 15
  var map = L.map('map').setView([50.47296726489117, 6.954176637076611], 15);

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

  // ✅ ÄNDERUNG 2: Esri Satellit beim Start aktivieren
  esriSatellite.addTo(map);

  // Array für alle Layer
  var allLayers = [];

  // ============================================
  // BASE LAYER CONTROL (Kartenauswahl)
  // ✅ ÄNDERUNG 3: Sentinel-2 entfernt
  // ============================================
  
  var baseMaps = {
    "OpenStreetMap": osmStandard,
    "Humanitarian": osmHumanitarian,
    "Satellit (Esri)": esriSatellite,
    "Google Satellit": googleSatellite,
    "CartoDB Voyager": cartoVoyager
  };

  // ✅ ÄNDERUNG 4: Höhenlinien entfernt
  var overlayMaps = {};

  // Standard Layer Control für Basiskarten hinzufügen (unten links)
  var layerControl = L.control.layers(baseMaps, overlayMaps, {
    position: 'bottomleft',
    collapsed: false
  }).addTo(map);
  
  // Speichere Layer Control global für Ahrtal-Layer
  window.globalLayerControl = layerControl;
  
  // ============================================
  // TOGGLE BASE LAYER ZUM AUSBLENDEN
  // ============================================
  
  // ✅ ÄNDERUNG 5: lastSelectedBaseLayer auf Esri
  var lastSelectedBaseLayer = esriSatellite;
  
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
  // ✅ ÄNDERUNGEN 6 & 7: Beim Start aktiviert
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
      checkbox.checked = true; // ✅ Beim Start aktiviert
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
      mapElement.classList.add('monochrome'); // ✅ Sofort aktivieren
      
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

  // ============================================
  // ✅ ÄNDERUNG 8: LEGENDE EIN-/AUSBLENDEN
  // ============================================
  
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (legendControl) {
      // Erstelle Toggle-Button
      var toggleButton = document.createElement('button');
      toggleButton.innerHTML = '◀';
      toggleButton.className = 'legend-toggle-button';
      toggleButton.title = 'Legende ein-/ausblenden';
      toggleButton.style.cssText = `
        position: absolute;
        left: -30px;
        top: 10px;
        width: 28px;
        height: 28px;
        background: white;
        border: none;
        border-radius: 4px 0 0 4px;
        box-shadow: -2px 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        color: #333;
        z-index: 1000;
      `;
      
      legendControl.style.position = 'relative';
      legendControl.appendChild(toggleButton);
      
      var isVisible = true;
      toggleButton.addEventListener('click', function() {
        if (isVisible) {
          // Ausblenden
          legendControl.style.transform = 'translateX(100%)';
          legendControl.style.opacity = '0';
          toggleButton.style.left = '-40px';
          toggleButton.innerHTML = '▶';
          isVisible = false;
        } else {
          // Einblenden
          legendControl.style.transform = 'translateX(0)';
          legendControl.style.opacity = '1';
          toggleButton.style.left = '-30px';
          toggleButton.innerHTML = '◀';
          isVisible = true;
        }
      });
      
      // Sanfte Animation
      legendControl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }
  }, 600);

  // Karte nach kurzer Verzögerung neu rendern
  setTimeout(function() { 
    map.invalidateSize(); 
  }, 100);
  
  // ============================================
  // HOCHAUFLÖSENDER KARTEN-EXPORT
  // ============================================
  
  L.easyPrint({
    title: 'Karte als PNG exportieren',
    position: 'topleft',
    sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
    filename: 'EMSR517_AOI15_Schuld_Flutkatastrophe',
    exportOnly: true,
    hideControlContainer: true,
    hideClasses: ['leaflet-control-layers', 'custom-layer-control'],
    customWindowTitle: 'EMSR517 AOI15 - Schuld Flutkatastrophe Export'
  }).addTo(map);
  
  console.log('✓ Karte geladen - Monochrome Filter & Export verfügbar');
  console.log('🌊 Ahrtal-Layer-Integration aktiviert');
  console.log('🎨 Esri Satellit & Monochrome beim Start aktiv');
  console.log('📖 Legende ist ein-/ausblendbar');
  console.log('🗺️ Zoom 15 @ 50.473°N, 6.954°E');
});