document.addEventListener('DOMContentLoaded', function () {
  
  var map = L.map('map').setView([50.450453753490834, 6.888650882405452], 13);

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
  var googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google'
  });

  // CartoDB Voyager (schöne Übersichtskarte)
  var cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  });

  // Standard-Karte beim Start anzeigen
  osmStandard.addTo(map);

  // Zentrums-Marker
  //var marker = L.marker([50.450453753490834, 6.888650882405452]).addTo(map);
  //marker.bindPopup("<b>Schuld</b><br>Zentrum der Betrachtung").openPopup();

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
    "CartoDB Voyager": cartoVoyager
  };

  // ============================================
  // OVERLAY LAYERS (Ein-/Ausblendbare Ebenen)
  // ============================================
  
  var overlayMaps = {};

  // Layer Control hinzufügen (oben rechts)
  L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: false
  }).addTo(map);

  // ============================================
  // RAPID MAPPING DATEN LADEN
  // ============================================
  
  // Funktion aus RM11.08.21.js aufrufen
  loadRapidMappingData(map, allLayers);

  // Karte nach kurzer Verzögerung neu rendern
  setTimeout(() => map.invalidateSize(), 100);
});