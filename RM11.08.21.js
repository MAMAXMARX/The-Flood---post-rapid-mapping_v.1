// ============================================
// RAPID MAPPING DATEN - 11.08.2021
// EMSR517 AOI15 - Schuld Flutkatastrophe
// ============================================

// Layer-Gruppen für die Legende
var layerGroups = {
  aoi: L.layerGroup(),
  buildings: L.layerGroup(),
  floodedArea: L.layerGroup(),
  floodTrace: L.layerGroup()
};

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

function getFloodStyle(notation) {
  if (notation === 'Flooded area') {
    return {
      color: '#0066cc',
      fillColor: '#3399ff',
      fillOpacity: 0.5,
      weight: 2
    };
  } else if (notation === 'Flood trace') {
    return {
      color: '#006666',
      fillColor: '#00cccc',
      fillOpacity: 0.3,
      weight: 1
    };
  }
  // Fallback für andere Notationen
  return {
    color: '#9af3ff85',
    fillOpacity: 0.5,
    weight: 1
  };
}

function loadGeoJSON(url, style, layerName, description, map, allLayers) {
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
            
            // Wenn notation vorhanden ist, speziellen Stil verwenden
            var polygonStyle = style;
            if (feature.properties && feature.properties.notation) {
              polygonStyle = getFloodStyle(feature.properties.notation);
            }
            
            var polygon = L.polygon(leafletCoords, polygonStyle).addTo(map);

            var popupContent = `<b>${layerName}</b><br>`;
            popupContent += `<i>${description}</i><br>`;
            
            // Notation hervorheben falls vorhanden
            if (feature.properties && feature.properties.notation) {
              popupContent += `<br><b>Typ:</b> ${feature.properties.notation}<br>`;
            }
            
            if (feature.properties) {
              popupContent += '<br><b>Details:</b><br>';
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
      updateMapView(map, allLayers);
    })
    .catch(error => {
      console.error(`✗ Fehler beim Laden von ${layerName}:`, error);
      console.log(`  Überprüfe, ob die Datei existiert: ${url}`);
    });
}

function updateMapView(map, allLayers) {
  if (allLayers.length > 0) {
    var group = L.featureGroup(allLayers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
    console.log(`✓ Karte angepasst für ${allLayers.length} Layer`);
  }
}

// Hauptfunktion zum Laden aller Rapid Mapping Daten
function loadRapidMappingData(map, allLayers) {
  
  // Area of Interest A (Untersuchungsgebiet)
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_areaOfInterestA_r1_v3.json',
    {
      color: '#7e0909ff',
      fillOpacity: 0,
      weight: 1
    },
    'Area of Interest A',
    'AOI - Untersuchungsgebiet',
    map,
    allLayers
  );

  // Observed Event A (Überschwemmungsgebiet)
  // Wird automatisch nach "Flooded area" (dunkelblau) und "Flood trace" (türkis) unterschieden
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_observedEventA_r1_v3.json',
    null, // Stil wird automatisch durch getFloodStyle() gesetzt
    'Überschwemmungsgebiet',
    'Observed Event A',
    map,
    allLayers
  );

  // Built Up Points (Gebäude mit Schadensgrad)
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_builtUpP_r1_v3.json',
    null,
    'Gebäude',
    'Residential Buildings',
    map,
    allLayers
  );
}