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

  // Karte nach kurzer Verzögerung neu rendern
  setTimeout(function() { 
    map.invalidateSize(); 
  }, 100);
});