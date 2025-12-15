// ============================================
// RAPID MAPPING DATEN - 11.08.2021
// EMSR517 AOI15 - Schuld Flutkatastrophe
// ============================================

// Layer-Gruppen für die Legende
var layerGroups = {
  aoi: L.layerGroup(),
  buildings: L.layerGroup(),
  floodedArea: L.layerGroup(),
  floodTrace: L.layerGroup(),
  facilities: L.layerGroup()
};

function getFacilityStyle(damageGrade) {
  // Für Facilities (Polygone) andere Farben als für Gebäude (Punkte)
  switch(damageGrade) {
    case 'Destroyed':
      return {
        color: '#8B0000',
        fillColor: '#8B0000',
        fillOpacity: 0.4,
        weight: 2
      };
    case 'Damaged':
      return {
        color: '#FF6347',
        fillColor: '#FF6347',
        fillOpacity: 0.4,
        weight: 2
      };
    case 'Possibly damaged':
      return {
        color: '#FFA500',
        fillColor: '#FFA500',
        fillOpacity: 0.3,
        weight: 2
      };
    default:
      return {
        color: '#999999',
        fillColor: '#999999',
        fillOpacity: 0.3,
        weight: 2
      };
  }
}

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

function loadGeoJSON(url, style, layerName, description, map, allLayers, targetGroup) {
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
            
            // Stil-Logik: Reihenfolge ist wichtig!
            var polygonStyle = style;
            
            // 1. Zuerst prüfen ob es eine Facility ist (hat targetGroup facilities)
            if (feature.properties && feature.properties.damage_gra && targetGroup === layerGroups.facilities) {
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
              polygon.addTo(layerGroups.floodedArea);
            } else if (feature.properties && feature.properties.notation === 'Flood trace') {
              polygon.addTo(layerGroups.floodTrace);
            } else if (targetGroup) {
              polygon.addTo(targetGroup);
            } else {
              polygon.addTo(map);
            }

            var popupContent = `<b>${layerName}</b><br>`;
            popupContent += `<i>${description}</i><br>`;
            
            // Notation hervorheben falls vorhanden
            if (feature.properties && feature.properties.notation) {
              popupContent += `<br><b>Typ:</b> ${feature.properties.notation}<br>`;
            }
            
            // Speziell für Facilities: Name und Info hervorheben
            if (feature.properties && feature.properties.name && targetGroup === layerGroups.facilities) {
              popupContent += `<br><b>Name:</b> ${feature.properties.name}<br>`;
            }
            if (feature.properties && feature.properties.info) {
              popupContent += `<b>Info:</b> ${feature.properties.info}<br>`;
            }
            if (feature.properties && feature.properties.damage_gra) {
              var damageColor = targetGroup === layerGroups.facilities ? 
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
            
            // Zu entsprechender Gruppe hinzufügen basierend auf Schadensgrad
            if (targetGroup) {
              circleMarker.addTo(targetGroup);
            } else {
              circleMarker.addTo(map);
            }

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
    allLayers,
    layerGroups.aoi
  );

  // Observed Event A (Überschwemmungsgebiet)
  // Wird automatisch nach "Flooded area" (dunkelblau) und "Flood trace" (türkis) unterschieden
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_observedEventA_r1_v3.json',
    null, // Stil wird automatisch durch getFloodStyle() gesetzt
    'Überschwemmungsgebiet',
    'Observed Event A',
    map,
    allLayers,
    null // Wird automatisch aufgeteilt in floodedArea und floodTrace
  );

  // Built Up Points (Gebäude mit Schadensgrad)
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_builtUpP_r1_v3.json',
    null,
    'Gebäude',
    'Residential Buildings',
    map,
    allLayers,
    layerGroups.buildings
  );

  // Facilities (Infrastruktur und öffentliche Einrichtungen)
  loadGeoJSON(
    './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_facilitiesA_r1_v3.json',
    null,
    'Infrastruktur',
    'Facilities',
    map,
    allLayers,
    layerGroups.facilities
  );
}

// Erweiterte Layer Control mit Hierarchie erstellen
function createCustomLayerControl(map) {
  var controlDiv = L.DomUtil.create('div', 'custom-layer-control');
  controlDiv.innerHTML = `
    <div class="legend-main-header">
      <strong>Rapid Mapping EMSR517</strong>
    </div>
    
    <div class="legend-date-section">
      <div class="legend-date-header" data-section="19_07">
        <span class="section-toggle-icon">▶</span>
        <div class="date-header-content">
          <strong>19.07.2021 - Erstaufnahme</strong>
          <small>Erste Rapid Mapping Daten</small>
        </div>
      </div>
      <div class="legend-date-content" data-section-content="19_07" style="display: none;"></div>
    </div>
    
    <div class="legend-date-section">
      <div class="legend-date-header" data-section="11_08">
        <span class="section-toggle-icon">▶</span>
        <div class="date-header-content">
          <strong>11.08.2021 - Monitoring</strong>
          <small>Ortssituation am 20/07/2021, 10:35 Uhr</small>
        </div>
      </div>
      <div class="legend-date-content" data-section-content="11_08" style="display: none;">
        
        <div class="legend-section-compact">
          <label class="legend-item-compact">
            <input type="checkbox" class="layer-toggle" data-layer="aoi" data-date="11_08" checked>
            <span class="layer-name">Untersuchungsgebiet</span>
            <span class="legend-symbol-small" style="border: 2px solid #7e0909ff; background: transparent;"></span>
          </label>
        </div>
        
        <div class="legend-section-compact">
          <div class="legend-category-compact">
            <span class="toggle-icon-small">▼</span>
            <label>
              <input type="checkbox" class="category-toggle" data-category="buildings" data-date="11_08" checked>
              <strong>Betroffene Gebäude</strong>
            </label>
          </div>
          <div class="legend-subcategory-compact" data-category="buildings">
            <label class="legend-item-compact">
              <span class="layer-name">Mögl. beschädigt</span>
              <span class="legend-symbol-small" style="background: #ffb55459; border: 1px solid #ffb554;"></span>
            </label>
            <label class="legend-item-compact">
              <span class="layer-name">Beschädigt</span>
              <span class="legend-symbol-small" style="background: #ac3d3d62; border: 1px solid #ac3d3d;"></span>
            </label>
            <label class="legend-item-compact">
              <span class="layer-name">Zerstört</span>
              <span class="legend-symbol-small" style="background: #3d070758; border: 1px solid #3d0707;"></span>
            </label>
          </div>
        </div>
        
        <div class="legend-section-compact">
          <div class="legend-category-compact">
            <span class="toggle-icon-small">▼</span>
            <label>
              <input type="checkbox" class="category-toggle" data-category="facilities" data-date="11_08" checked>
              <strong>Infrastruktur</strong>
            </label>
          </div>
          <div class="legend-subcategory-compact" data-category="facilities">
            <label class="legend-item-compact">
              <span class="layer-name">Mögl. beschädigt</span>
              <span class="legend-symbol-small" style="background: #FFA500; border: 2px solid #FFA500; opacity: 0.6;"></span>
            </label>
            <label class="legend-item-compact">
              <span class="layer-name">Beschädigt</span>
              <span class="legend-symbol-small" style="background: #FF6347; border: 2px solid #FF6347; opacity: 0.6;"></span>
            </label>
            <label class="legend-item-compact">
              <span class="layer-name">Zerstört</span>
              <span class="legend-symbol-small" style="background: #8B0000; border: 2px solid #8B0000; opacity: 0.6;"></span>
            </label>
          </div>
        </div>
        
        <div class="legend-section-compact">
          <div class="legend-category-compact">
            <span class="toggle-icon-small">▼</span>
            <label>
              <input type="checkbox" class="category-toggle" data-category="flood" data-date="11_08" checked>
              <strong>Überschwemmung</strong>
            </label>
          </div>
          <div class="legend-subcategory-compact" data-category="flood">
            <label class="legend-item-compact">
              <input type="checkbox" class="layer-toggle" data-layer="floodedArea" data-date="11_08" checked>
              <span class="layer-name">Flooded Area</span>
              <span class="legend-symbol-small" style="background: #3399ff; border: 2px solid #0066cc;"></span>
            </label>
            <label class="legend-item-compact">
              <input type="checkbox" class="layer-toggle" data-layer="floodTrace" data-date="11_08" checked>
              <span class="layer-name">Flood Trace</span>
              <span class="legend-symbol-small" style="background: #00cccc; border: 1px solid #006666;"></span>
            </label>
          </div>
        </div>
        
        <div class="legend-info-compact">
          <small>
            Event: 13/07/2021 16:00<br>
            Activation: 13/07/2021 17:11<br>
            Map production: 11/08/2021
          </small>
        </div>
        
      </div>
    </div>
  `;

  // Event Listeners für Layer-Toggles (11.08)
  controlDiv.querySelectorAll('.layer-toggle[data-date="11_08"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      var layerName = this.getAttribute('data-layer');
      if (this.checked) {
        map.addLayer(layerGroups[layerName]);
      } else {
        map.removeLayer(layerGroups[layerName]);
      }
    });
  });

  // Event Listeners für Kategorie-Toggles (11.08)
  controlDiv.querySelectorAll('.category-toggle[data-date="11_08"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      var category = this.getAttribute('data-category');
      if (category === 'buildings') {
        if (this.checked) {
          map.addLayer(layerGroups.buildings);
        } else {
          map.removeLayer(layerGroups.buildings);
        }
      } else if (category === 'facilities') {
        if (this.checked) {
          map.addLayer(layerGroups.facilities);
        } else {
          map.removeLayer(layerGroups.facilities);
        }
      } else if (category === 'flood') {
        var subcategory = this.closest('.legend-section-compact').querySelector('.legend-subcategory-compact');
        subcategory.querySelectorAll('.layer-toggle').forEach(function(subCheckbox) {
          if (this.checked) {
            subCheckbox.checked = true;
            map.addLayer(layerGroups[subCheckbox.getAttribute('data-layer')]);
          } else {
            subCheckbox.checked = false;
            map.removeLayer(layerGroups[subCheckbox.getAttribute('data-layer')]);
          }
        }.bind(this));
      }
    });
  });

  // Toggle Icons für Ein-/Ausklappen der Kategorien (11.08)
  controlDiv.querySelectorAll('.legend-category-compact').forEach(function(category) {
    category.addEventListener('click', function(e) {
      if (e.target.classList.contains('toggle-icon-small') || e.target.tagName === 'STRONG') {
        var icon = this.querySelector('.toggle-icon-small');
        var subcategory = this.parentElement.querySelector('.legend-subcategory-compact');
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
  
  // Event Listeners für Datums-Header (Auf-/Zuklappen der ganzen Abschnitte)
  controlDiv.querySelectorAll('.legend-date-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var section = this.getAttribute('data-section');
      var content = controlDiv.querySelector(`[data-section-content="${section}"]`);
      var icon = this.querySelector('.section-toggle-icon');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
      } else {
        content.style.display = 'none';
        icon.textContent = '▶';
      }
    });
  });

  var CustomControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    onAdd: function(map) {
      return controlDiv;
    }
  });

  new CustomControl().addTo(map);
  
  // NICHT: Object.values(layerGroups).forEach(...addTo(map))
  // Layer bleiben ausgeblendet bis der Nutzer sie aktiviert
}