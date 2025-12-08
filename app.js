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

  var marker = L.marker([50.450453753490834, 6.888650882405452]).addTo(map);
  marker.bindPopup("<b>Schuld</b><br>Zentrum der Betrachtung").openPopup();

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
  // JSON-DATEIEN LADEN
  // ============================================
  
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_areaOfInterestA_r1_v3.json',
    {
      color: '#7e0909ff',
      fillOpacity: 0,
      weight: 1
  
    },
    'Area of Interest A',
    'AOI - Untersuchungsgebiet'
  );

  loadGeoJSON(
    ' ./11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_observedEventA_r1_v3.json',
    {
      color: '#9af3ff85',
      fillOpacity: 0.5,
      weight: 1
  
    },
   );

  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_builtUpP_r1_v3.json',
    null,
    'Gebäude',
    'Residential Buildings'
  );

  function getDamageColor(damageGrade) {
    switch(damageGrade) {
      case 'Destroyed':
        return '#3d070758';
      case 'Damaged':
        return '#ac3d3d62';
      case 'Possibly damaged':
        return '#ffb55459';
      default:
        return '#999999';
    }
  }

  function loadGeoJSON(url, style, layerName, description) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`✓ Erfolgreich geladen: ${layerName}`, data);
        
        var features = data.features || [data];
        
        features.forEach((feature, index) => {
          if (feature.geometry) {
            var geomType = feature.geometry.type;
            
            if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
              var coords = feature.geometry.coordinates[0];
              var leafletCoords = coords.map(coord => [coord[1], coord[0]]);
              var polygon = L.polygon(leafletCoords, style).addTo(map);

              var popupContent = `<b>${layerName}</b><br>`;
              popupContent += `<i>${description}</i><br><br>`;
              
              if (feature.properties) {
                popupContent += '<b>Details:</b><br>';
                for (var key in feature.properties) {
                  popupContent += `${key}: ${feature.properties[key]}<br>`;
                }
              }
              
              polygon.bindPopup(popupContent);
              allLayers.push(polygon);
            }
            
            else if (geomType === 'Point') {
              var coords = feature.geometry.coordinates;
              var latLng = [coords[1], coords[0]];
              
              var damageGrade = feature.properties ? feature.properties.damage_gra : null;
              var pointColor = getDamageColor(damageGrade);
              
              var circleMarker = L.circleMarker(latLng, {
                radius: 5,
                color: pointColor,
                fillColor: pointColor,
                fillOpacity: 0.8,
                weight: 1
              }).addTo(map);

              var popupContent = `<b>${layerName}</b><br>`;
              
              if (feature.properties) {
                if (feature.properties.damage_gra) {
                  popupContent += `<b style="color: ${pointColor}">● ${feature.properties.damage_gra}</b><br><br>`;
                }
                for (var key in feature.properties) {
                  popupContent += `${key}: ${feature.properties[key]}<br>`;
                }
              }
              
              circleMarker.bindPopup(popupContent);
              allLayers.push(circleMarker);
            }
          }
        });

        console.log(`  → ${features.length} Features hinzugefügt`);
        updateMapView();
      })
      .catch(error => {
        console.error(`✗ Fehler beim Laden von ${layerName}:`, error);
        console.log(`  Überprüfe, ob die Datei existiert: ${url}`);
      });
  }

  function updateMapView() {
    if (allLayers.length > 0) {
      var group = L.featureGroup(allLayers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
      console.log(`✓ Karte angepasst für ${allLayers.length} Layer`);
    }
  }

  setTimeout(() => map.invalidateSize(), 100);
});