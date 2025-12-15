// ============================================
// RAPID MAPPING DATEN - 19.07.2021
// EMSR517 AOI15 - Schuld Flutkatastrophe
// ============================================

// Layer-Gruppen für die Legende (19.07 Daten)
var layerGroups_19_07 = {
  aoi: L.layerGroup(),
  buildings: L.layerGroup(),
  floodedArea: L.layerGroup(),
  floodTrace: L.layerGroup(),
  facilities: L.layerGroup()
};

// Hauptfunktion zum Laden aller Rapid Mapping Daten vom 19.07.2021
function loadRapidMappingData_19_07(map, allLayers) {
  
  // Area of Interest A (Untersuchungsgebiet)
  loadGeoJSON(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_areaOfInterestA_r1_v1.json',
    {
      color: '#7e0909ff',
      fillOpacity: 0,
      weight: 1
    },
    'Area of Interest A',
    'AOI - Untersuchungsgebiet',
    map,
    allLayers,
    layerGroups_19_07.aoi
  );

  // Observed Event A (Überschwemmungsgebiet)
  // Wird automatisch nach "Flooded area" (dunkelblau) und "Flood trace" (türkis) unterschieden
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_observedEventA_r1_v1.json',
    null,
    'Überschwemmungsgebiet',
    'Observed Event A',
    map,
    allLayers,
    null // Wird automatisch aufgeteilt
  );

  // Built Up Points (Gebäude mit Schadensgrad)
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_builtUpP_r1_v1.json',
    null,
    'Gebäude',
    'Residential Buildings',
    map,
    allLayers,
    layerGroups_19_07.buildings
  );

  // Facilities (Infrastruktur und öffentliche Einrichtungen)
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_facilitiesA_r1_v1.json',
    null,
    'Infrastruktur',
    'Facilities',
    map,
    allLayers,
    layerGroups_19_07.facilities
  );
}

// Spezielle loadGeoJSON Funktion für 19.07 Daten
function loadGeoJSON_19_07(url, style, layerName, description, map, allLayers, targetGroup) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`✓ Erfolgreich geladen (19.07): ${layerName}`, data);
      
      var features = data.features || [data];
      
      features.forEach((feature, index) => {
        if (feature.geometry) {
          var geomType = feature.geometry.type;
          
          if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
            var coords = feature.geometry.coordinates[0];
            var leafletCoords = coords.map(coord => [coord[1], coord[0]]);
            
            // Stil-Logik: Reihenfolge ist wichtig!
            var polygonStyle = style;
            
            // 1. Zuerst prüfen ob es eine Facility ist
            if (feature.properties && feature.properties.damage_gra && targetGroup === layerGroups_19_07.facilities) {
              polygonStyle = getFacilityStyle(feature.properties.damage_gra);
            }
            // 2. Dann prüfen ob es Flood-Daten mit spezifischer Notation sind
            else if (feature.properties && feature.properties.notation && 
                     (feature.properties.notation === 'Flooded area' || feature.properties.notation === 'Flood trace')) {
              polygonStyle = getFloodStyle(feature.properties.notation);
            }
            
            var polygon = L.polygon(leafletCoords, polygonStyle);
            
            // Zu Gruppe hinzufügen basierend auf Notation oder targetGroup
            if (feature.properties && feature.properties.notation === 'Flooded area') {
              polygon.addTo(layerGroups_19_07.floodedArea);
            } else if (feature.properties && feature.properties.notation === 'Flood trace') {
              polygon.addTo(layerGroups_19_07.floodTrace);
            } else if (targetGroup) {
              polygon.addTo(targetGroup);
            } else {
              polygon.addTo(map);
            }

            var popupContent = `<b>${layerName} (19.07.2021)</b><br>`;
            popupContent += `<i>${description}</i><br>`;
            
            // Notation hervorheben falls vorhanden
            if (feature.properties && feature.properties.notation) {
              popupContent += `<br><b>Typ:</b> ${feature.properties.notation}<br>`;
            }
            
            // Speziell für Facilities: Name und Info hervorheben
            if (feature.properties && feature.properties.name && targetGroup === layerGroups_19_07.facilities) {
              popupContent += `<br><b>Name:</b> ${feature.properties.name}<br>`;
            }
            if (feature.properties && feature.properties.info) {
              popupContent += `<b>Info:</b> ${feature.properties.info}<br>`;
            }
            if (feature.properties && feature.properties.damage_gra) {
              var damageColor = targetGroup === layerGroups_19_07.facilities ? 
                getFacilityStyle(feature.properties.damage_gra).color : 
                getDamageColor(feature.properties.damage_gra);
              popupContent += `<b style="color: ${damageColor}">● Schaden:</b> ${feature.properties.damage_gra}<br>`;
            }
            
            if (feature.properties) {
              popupContent += '<br><b>Details:</b><br>';
              for (var key in feature.properties) {
                // Bereits angezeigte Properties überspringen
                if (key !== 'notation' && key !== 'name' && key !== 'info' && key !== 'damage_gra') {
                  popupContent += `${key}: ${feature.properties[key]}<br>`;
                }
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
            });
            
            // Zu entsprechender Gruppe hinzufügen
            if (targetGroup) {
              circleMarker.addTo(targetGroup);
            } else {
              circleMarker.addTo(map);
            }

            var popupContent = `<b>${layerName} (19.07.2021)</b><br>`;
            
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

      console.log(`  → ${features.length} Features hinzugefügt (19.07)`);
      updateMapView(map, allLayers);
    })
    .catch(error => {
      console.error(`✗ Fehler beim Laden von ${layerName} (19.07):`, error);
      console.log(`  Überprüfe, ob die Datei existiert: ${url}`);
    });
}

// Layer Control für 19.07 Daten erweitern
function addLayerControl_19_07_ToExisting(controlDiv, map) {
  
  var section_19_07 = document.createElement('div');
  section_19_07.innerHTML = `
    <div class="legend-divider" style="border-top: 3px solid #333; margin: 20px 0 15px 0;"></div>
    
    <div class="legend-header" style="border-bottom: 2px solid #666; padding-bottom: 10px; margin-bottom: 15px;">
      <strong>Rapid Mapping</strong>
      <div class="legend-subtitle">Ortssituation am 19/07/2021, 11:30 Uhr</div>
      <div class="legend-info">
        <small>
          Event: 13/07/2021 16:00<br>
          Activation: 13/07/2021 17:11<br>
          Map production: 19/07/2021
        </small>
      </div>
    </div>
    
    <div class="legend-section">
      <label class="legend-item">
        <input type="checkbox" class="layer-toggle" data-layer="aoi_19_07" data-date="19_07" checked>
        <span class="layer-name">Untersuchungsgebiet</span>
        <span class="legend-symbol" style="border: 2px solid #7e0909ff; background: transparent;"></span>
      </label>
    </div>
    
    <div class="legend-section">
      <div class="legend-category">
        <span class="toggle-icon">▼</span>
        <label>
          <input type="checkbox" class="category-toggle" data-category="buildings_19_07" data-date="19_07" checked>
          <strong>Betroffene Gebäude</strong>
        </label>
      </div>
      <div class="legend-subcategory" data-category="buildings">
        <label class="legend-item">
          <span class="layer-name">Möglicherweise beschädigt</span>
          <span class="legend-symbol" style="background: #ffb55459; border: 1px solid #ffb554;"></span>
        </label>
        <label class="legend-item">
          <span class="layer-name">Beschädigt</span>
          <span class="legend-symbol" style="background: #ac3d3d62; border: 1px solid #ac3d3d;"></span>
        </label>
        <label class="legend-item">
          <span class="layer-name">Zerstört</span>
          <span class="legend-symbol" style="background: #3d070758; border: 1px solid #3d0707;"></span>
        </label>
      </div>
    </div>
    
    <div class="legend-section">
      <div class="legend-category">
        <span class="toggle-icon">▼</span>
        <label>
          <input type="checkbox" class="category-toggle" data-category="facilities_19_07" data-date="19_07" checked>
          <strong>Infrastruktur & Einrichtungen</strong>
        </label>
      </div>
      <div class="legend-subcategory" data-category="facilities">
        <label class="legend-item">
          <span class="layer-name">Möglicherweise beschädigt</span>
          <span class="legend-symbol" style="background: #FFA500; border: 2px solid #FFA500; opacity: 0.6;"></span>
        </label>
        <label class="legend-item">
          <span class="layer-name">Beschädigt</span>
          <span class="legend-symbol" style="background: #FF6347; border: 2px solid #FF6347; opacity: 0.6;"></span>
        </label>
        <label class="legend-item">
          <span class="layer-name">Zerstört</span>
          <span class="legend-symbol" style="background: #8B0000; border: 2px solid #8B0000; opacity: 0.6;"></span>
        </label>
      </div>
    </div>
    
    <div class="legend-section">
      <div class="legend-category">
        <span class="toggle-icon">▼</span>
        <label>
          <input type="checkbox" class="category-toggle" data-category="flood_19_07" data-date="19_07" checked>
          <strong>Überschwemmungsgebiet</strong>
        </label>
      </div>
      <div class="legend-subcategory" data-category="flood">
        <label class="legend-item">
          <input type="checkbox" class="layer-toggle" data-layer="floodedArea_19_07" data-date="19_07" checked>
          <span class="layer-name">Überflutetes Gebiet</span>
          <span class="legend-symbol" style="background: #3399ff; border: 2px solid #0066cc;"></span>
        </label>
        <label class="legend-item">
          <input type="checkbox" class="layer-toggle" data-layer="floodTrace_19_07" data-date="19_07" checked>
          <span class="layer-name">Überschwemmungs-Spur</span>
          <span class="legend-symbol" style="background: #00cccc; border: 1px solid #006666;"></span>
        </label>
      </div>
    </div>
  `;
  
  controlDiv.appendChild(section_19_07);
  
  // Event Listeners für Layer-Toggles (19.07)
  section_19_07.querySelectorAll('.layer-toggle[data-date="19_07"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      var layerName = this.getAttribute('data-layer').replace('_19_07', '');
      if (this.checked) {
        map.addLayer(layerGroups_19_07[layerName]);
      } else {
        map.removeLayer(layerGroups_19_07[layerName]);
      }
    });
  });

  // Event Listeners für Kategorie-Toggles (19.07)
  section_19_07.querySelectorAll('.category-toggle[data-date="19_07"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      var category = this.getAttribute('data-category').replace('_19_07', '');
      if (category === 'buildings') {
        if (this.checked) {
          map.addLayer(layerGroups_19_07.buildings);
        } else {
          map.removeLayer(layerGroups_19_07.buildings);
        }
      } else if (category === 'facilities') {
        if (this.checked) {
          map.addLayer(layerGroups_19_07.facilities);
        } else {
          map.removeLayer(layerGroups_19_07.facilities);
        }
      } else if (category === 'flood') {
        var subcategory = this.closest('.legend-section').querySelector('.legend-subcategory');
        subcategory.querySelectorAll('.layer-toggle').forEach(function(subCheckbox) {
          if (this.checked) {
            subCheckbox.checked = true;
            var layerName = subCheckbox.getAttribute('data-layer').replace('_19_07', '');
            map.addLayer(layerGroups_19_07[layerName]);
          } else {
            subCheckbox.checked = false;
            var layerName = subCheckbox.getAttribute('data-layer').replace('_19_07', '');
            map.removeLayer(layerGroups_19_07[layerName]);
          }
        }.bind(this));
      }
    });
  });

  // Toggle Icons für Ein-/Ausklappen (19.07)
  section_19_07.querySelectorAll('.legend-category').forEach(function(category) {
    category.addEventListener('click', function(e) {
      if (e.target.classList.contains('toggle-icon') || e.target.tagName === 'STRONG') {
        var icon = this.querySelector('.toggle-icon');
        var subcategory = this.parentElement.querySelector('.legend-subcategory');
        if (subcategory.style.display === 'none') {
          subcategory.style.display = 'block';
          icon.textContent = '▼';
        } else {
          subcategory.style.display = 'none';
          icon.textContent = '▶';
        }
      }
    });
  });
  
  // Alle Layer-Gruppen initial zur Karte hinzufügen
  Object.values(layerGroups_19_07).forEach(function(group) {
    map.addLayer(group);
  });
}