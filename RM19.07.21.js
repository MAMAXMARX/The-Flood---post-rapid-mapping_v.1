// ============================================
// RAPID MAPPING DATEN - 19.07.2021
// EMSR517 AOI15 - Ahrtal Flutkatastrophe
// ============================================

// Layer-Gruppen für die Legende (19.07 Daten)
var layerGroups_19_07 = {
  aoi: L.layerGroup(),
  buildings: L.layerGroup(),
  floodedArea: L.layerGroup(),
  floodTrace: L.layerGroup(),
  facilities: L.layerGroup(),
  transportation: L.layerGroup(),
  notAnalysed: L.layerGroup(),
  hydrography: L.layerGroup()
};

// ✅ Speichere alle Layer separat für effizientes Filtern (19.07)
var allLayersByGroup_19_07 = {
  buildings: [],
  facilities: [],
  transportation: []
};

// Hauptfunktion zum Laden aller Rapid Mapping Daten vom 19.07.2021
function loadRapidMappingData_19_07(map, allLayers) {
  // ============================================
  // UNTERSUCHUNGSGEBIET MIT DOPPELTER KONTUR
  // ============================================
  
  // 1. Äußere Kontur (SCHWARZ, dicker)
  loadGeoJSON(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_areaOfInterestA_r1_v1.json',
    {
      color: '#000000',     // Schwarz
      fillOpacity: 0,       // Kein Filling
      weight: 1.5,            // Dicker für äußere Kontur
      opacity: 1
    },
    'Area of Interest A (Outer)',
    'AOI - Untersuchungsgebiet (äußere Kontur)',
    map,
    allLayers,
    layerGroups_19_07.aoi
  );

  // 2. Innere Kontur (WEISS, dünner) - wird ÜBER der schwarzen gezeichnet
  loadGeoJSON(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_areaOfInterestA_r1_v1.json',
    {
      color: '#FFFFFF',     // Weiß
      fillOpacity: 0,       // Kein Filling
      weight: 0.75,          // Dünner für innere Kontur
      opacity: 1
    },
    'Area of Interest A (Inner)',
    'AOI - Untersuchungsgebiet (innere Kontur)',
    map,
    allLayers,
    layerGroups_19_07.aoi
  );

  // Überschwemmungsgebiet
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_observedEventA_r1_v1.json',
    null,
    'Überschwemmungsgebiet',
    'Observed Event A',
    map,
    allLayers,
    null
  );

  // Infrastruktur
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_facilitiesA_r1_v1.json',
    null,
    'Infrastruktur',
    'Facilities',
    map,
    allLayers,
    layerGroups_19_07.facilities
  );

  // Betroffene Gebäude
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_builtUpP_r1_v1.json',
    null,
    'Gebäude',
    'Residential Buildings',
    map,
    allLayers,
    layerGroups_19_07.buildings
  );

  // ============================================
  // TRANSPORTATION (Straßen/Verkehr)
  // ============================================
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_transportationL_r1_v1.json',
    null,
    'Verkehr',
    'Transportation',
    map,
    allLayers,
    layerGroups_19_07.transportation
  );

  // ============================================
  // NOT ANALYSED (Nicht analysierte Bereiche)
  // ============================================
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_imageFootprint_r1_v1.json',
    {
      color: '#999999',
      weight: 1,
      opacity: 0.8,
      fillColor: '#ffffff7a',
      fillOpacity: 0.6,
      dashArray: '4, 4'
    },
    'Nicht analysiert',
    'Not Analysed / Image Footprint',
    map,
    allLayers,
    layerGroups_19_07.notAnalysed
  );
  
  // ============================================
  // HYDROGRAPHIE (Gewässer)
  // ============================================
  
  // Hydrographie - Flüsse und Bäche
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_hydrographyL_r1_v1.json',
    {
      color: '#00172f',
      weight: 2,
      opacity: 0.7
    },
    'Gewässer',
    'Hydrography Lines',
    map,
    allLayers,
    layerGroups_19_07.hydrography
  );
  
  // Hydrographie - Seen und Teiche
  loadGeoJSON_19_07(
    './19.07.2021_EMSR517_json/EMSR517_AOI15_GRA_PRODUCT_hydrographyA_r1_v1.json',
    {
      color: '#00172f',
      fillColor: '#0054a9',
      fillOpacity: 0.4,
      weight: 2
    },
    'Gewässer',
    'Hydrography Areas',
    map,
    allLayers,
    layerGroups_19_07.hydrography
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
          // FILTER: Für notAnalysed Layer nur "Not Analysed" Features laden
          if (targetGroup === layerGroups_19_07.notAnalysed) {
            if (!feature.properties || feature.properties.obj_type !== 'Not Analysed') {
              return; // Überspringe "Image Footprint" und andere
            }
          }
          
          var geomType = feature.geometry.type;
          
          if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
            var coords = feature.geometry.coordinates[0];
            var leafletCoords = coords.map(coord => [coord[1], coord[0]]);
            
            // Stil-Logik: Reihenfolge ist wichtig!
            var polygonStyle = style;
            
            // 1. Zuerst prüfen ob es eine Facility ist (jetzt mit Gebäude-Stil)
            if (feature.properties && feature.properties.damage_gra && targetGroup === layerGroups_19_07.facilities) {
              polygonStyle = getDamageStyle(feature.properties.damage_gra);
            }
            // 2. Dann prüfen ob es Flood-Daten mit spezifischer Notation sind
            else if (feature.properties && feature.properties.notation && 
                     (feature.properties.notation === 'Flooded area' || feature.properties.notation === 'Flood trace')) {
              polygonStyle = getFloodStyle(feature.properties.notation);
            }
            
            var polygon = L.polygon(leafletCoords, polygonStyle);
            
            // ✅ Feature-Referenz speichern für späteres Filtern
            polygon.feature = feature;
            
            // Zu Gruppe hinzufügen basierend auf Notation oder targetGroup
            if (feature.properties && feature.properties.notation === 'Flooded area') {
              polygon.addTo(layerGroups_19_07.floodedArea);
            } else if (feature.properties && feature.properties.notation === 'Flood trace') {
              polygon.addTo(layerGroups_19_07.floodTrace);
            } else if (targetGroup) {
              polygon.addTo(targetGroup);
              // ✅ Speichere in Array für Filtern
              if (targetGroup === layerGroups_19_07.buildings) {
                allLayersByGroup_19_07.buildings.push(polygon);
              } else if (targetGroup === layerGroups_19_07.facilities) {
                allLayersByGroup_19_07.facilities.push(polygon);
              }
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
              var damageColor = getDamageColor(feature.properties.damage_gra);
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
              color: '#000000',
              fillColor: pointColor,
              fillOpacity: 0.85,
              weight: 0.5
            });
            
            // ✅ Feature-Referenz speichern
            circleMarker.feature = feature;
            
            // Zu entsprechender Gruppe hinzufügen
            if (targetGroup) {
              circleMarker.addTo(targetGroup);
              // ✅ Speichere in Array für Filtern
              if (targetGroup === layerGroups_19_07.buildings) {
                allLayersByGroup_19_07.buildings.push(circleMarker);
              } else if (targetGroup === layerGroups_19_07.facilities) {
                allLayersByGroup_19_07.facilities.push(circleMarker);
              }
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
          
          else if (geomType === 'LineString' || geomType === 'MultiLineString') {
            var coords = feature.geometry.coordinates;
            var leafletCoords;
            
            if (geomType === 'MultiLineString') {
              leafletCoords = coords.map(function(lineString) {
                return lineString.map(function(coord) {
                  return [coord[1], coord[0]];
                });
              });
            } else {
              leafletCoords = [coords.map(function(coord) {
                return [coord[1], coord[0]];
              })];
            }
            
            // Bestimme den Style basierend auf der Zielgruppe
            var lineStyle;
            if (targetGroup === layerGroups_19_07.hydrography) {
              // Spezial-Style für Hydrographie (Flüsse/Bäche)
              lineStyle = style || {
                color: '#00172f',
                weight: 2,
                opacity: 0.7
              };
            } else {
              // Transportation-Style für Straßen
              var damageGrade = feature.properties ? feature.properties.damage_gra : null;
              lineStyle = getTransportationStyle(damageGrade);
            }
            
            leafletCoords.forEach(function(lineCoords) {
              var polyline = L.polyline(lineCoords, lineStyle);
              
              // ✅ Feature-Referenz speichern für späteres Filtern
              polyline.feature = feature;
              
              if (targetGroup) {
                polyline.addTo(targetGroup);
                // ✅ Speichere in Array für Filtern
                if (targetGroup === layerGroups_19_07.transportation) {
                  allLayersByGroup_19_07.transportation.push(polyline);
                }
              } else {
                polyline.addTo(map);
              }
              
              var popupContent = `<b>${layerName} (19.07.2021)</b><br>`;
              popupContent += `<i>${description}</i><br>`;
              
              if (feature.properties) {
                if (feature.properties.damage_gra) {
                  var damageColor = lineStyle.color;
                  popupContent += `<br><b style="color: ${damageColor}">● Schaden:</b> ${feature.properties.damage_gra}<br>`;
                }
                if (feature.properties.obj_type) {
                  popupContent += `<b>Typ:</b> ${feature.properties.obj_type}<br>`;
                }
                if (feature.properties.info) {
                  popupContent += `<b>Info:</b> ${feature.properties.info}<br>`;
                }
                if (feature.properties.name && feature.properties.name !== 'Unknown') {
                  popupContent += `<b>Name:</b> ${feature.properties.name}<br>`;
                }
                
                popupContent += '<br><b>Details:</b><br>';
                for (var key in feature.properties) {
                  if (key !== 'damage_gra' && key !== 'obj_type' && key !== 'info' && key !== 'name') {
                    popupContent += `${key}: ${feature.properties[key]}<br>`;
                  }
                }
              }
              
              polyline.bindPopup(popupContent);
              allLayers.push(polyline);
            });
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

// Style-Funktion für Gebäudeschäden (einheitlich für Buildings und Facilities)
function getDamageStyle(damageGrade) {
  switch(damageGrade) {
    case 'Destroyed':
      return {
        color: '#000000',
        fillColor: '#3d0707',
        fillOpacity: 0.85,
        weight: 0.5
      };
    case 'Damaged':
      return {
        color: '#000000',
        fillColor: '#ac3d3d',
        fillOpacity: 0.85,
        weight: 0.5
      };
    case 'Possibly damaged':
      return {
        color: '#000000',
        fillColor: '#ffb554',
        fillOpacity: 0.85,
        weight: 0.5
      };
    default:
      return {
        color: '#000000',
        fillColor: '#999999',
        fillOpacity: 0.85,
        weight: 0.5
      };
  }
}

function getFloodStyle(notation) {
  if (notation === 'Flooded area') {
    return {
      color: 'rgb(0, 54, 92)',
      fillColor: 'rgb(34, 84, 224)',
      fillOpacity: 0.3,
      weight: 1
    };
  } else if (notation === 'Flood trace') {
    return {
      color: '#03484eff',
      fillColor: '#0087c1',
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

function getDamageColor(damageGrade) {
  switch(damageGrade) {
    case 'Destroyed':
      return '#3d0707';
    case 'Damaged':
      return '#ac3d3d';
    case 'Possibly damaged':
      return '#ffb554';
    default:
      return '#999999';
  }
}

function getTransportationStyle(damageGrade) {
  // Spezielle Styles für Transportation (LineStrings)
  switch(damageGrade) {
    case 'Destroyed':
      return {
        color: '#3d0707',
        weight: 3,
        opacity: 0.9
      };
    case 'Damaged':
      return {
        color: '#ac3d3d',
        weight: 3,
        opacity: 0.8
      };
    case 'Possibly damaged':
      return {
        color: '#ffb554',
        weight: 3,
        opacity: 0.7
      };
    case 'No visible damage':
      return {
        color: '#999999',
        weight: 2,
        opacity: 0.6
      };
    case 'Not Analysed':
      return {
        color: '#cccccc',
        weight: 2,
        opacity: 0.5,
        dashArray: '5, 5'
      };
    default:
      return {
        color: '#999999',
        weight: 2,
        opacity: 0.5
      };
  }
}

// Layer Control für 19.07 Daten erweitern
function addLayerControl_19_07_ToExisting(controlDiv, map) {
  var content_19_07 = controlDiv.querySelector('[data-section-content="19_07"]');
  content_19_07.innerHTML = `
    <div class="legend-section-compact">
      <div class="legend-category-compact">
        <span class="toggle-icon-small">▼</span>
        <label style="flex:1;">
          <input type="checkbox" class="category-toggle" data-category="aoi_19_07" data-date="19_07">
          <strong>Untersuchungsgebiet (AoI)</strong>
        </label>
      </div>
      <div class="legend-subcategory-compact" data-category="aoi">
        <label class="legend-item-compact">
          <input type="checkbox" class="layer-toggle" data-layer="aoi_19_07" data-date="19_07">
          <span class="layer-name">Untersuchungsgebiet - AoI15</span>
          <span class="legend-symbol-small" style="border: 2px solid #000000; box-shadow: inset 0 0 0 1px #ffffff; background: transparent;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="layer-toggle" data-layer="notAnalysed_19_07" data-date="19_07">
          <span class="layer-name">Nicht analysiert (Wolken)</span>
          <span class="legend-symbol-small" style="background: #eeeeee; border: 1px dashed #666666;"></span>
        </label>
      </div>
    </div>
    <div class="legend-section-compact">
      <div class="legend-category-compact">
        <span class="toggle-icon-small">▼</span>
        <label style="flex:1;">
          <input type="checkbox" class="category-toggle" data-category="buildings_19_07" data-date="19_07">
          <strong>Betroffene Gebäude</strong>
        </label>
      </div>
      <div class="legend-subcategory-compact" data-category="buildings">
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Possibly damaged" data-group="combined" data-date="19_07">
          <span class="layer-name">Mögl. beschädigt</span>
          <span class="legend-symbol-small" style="background: #ffb55459; border: 1px solid #ffb554;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Damaged" data-group="combined" data-date="19_07">
          <span class="layer-name">Beschädigt</span>
          <span class="legend-symbol-small" style="background: #ac3d3d62; border: 1px solid #ac3d3d;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Destroyed" data-group="combined" data-date="19_07">
          <span class="layer-name">Zerstört</span>
          <span class="legend-symbol-small" style="background: #3d070758; border: 1px solid #3d0707;"></span>
        </label>
      </div>
    </div>
    <div class="legend-section-compact">
      <div class="legend-category-compact">
        <span class="toggle-icon-small">▼</span>
        <label style="flex:1;">
          <input type="checkbox" class="category-toggle" data-category="transportation_19_07" data-date="19_07">
          <strong>Infrastruktur</strong>
        </label>
      </div>
      <div class="legend-subcategory-compact" data-category="transportation">
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Possibly damaged" data-group="transportation" data-date="19_07">
          <span class="layer-name">Mögl. beschädigt</span>
          <span class="legend-symbol-small" style="background: #ffb554; border: none; height: 3px;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Damaged" data-group="transportation" data-date="19_07">
          <span class="layer-name">Beschädigt</span>
          <span class="legend-symbol-small" style="background: #ac3d3d; border: none; height: 3px;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="subtype-toggle" data-type="Destroyed" data-group="transportation" data-date="19_07">
          <span class="layer-name">Zerstört</span>
          <span class="legend-symbol-small" style="background: #3d0707; border: none; height: 3px;"></span>
        </label>
      </div>
    </div>
    <div class="legend-section-compact">
      <div class="legend-category-compact">
        <span class="toggle-icon-small">▼</span>
        <label style="flex:1;">
          <input type="checkbox" class="category-toggle" data-category="flood_19_07" data-date="19_07">
          <strong>Hydrographie</strong>
        </label>
      </div>
      <div class="legend-subcategory-compact" data-category="flood">
        <label class="legend-item-compact">
          <input type="checkbox" class="layer-toggle" data-layer="hydrography_19_07" data-date="19_07">
          <span class="layer-name">Gewässer</span>
          <span class="legend-symbol-small" style="background: #0054a9; border: 1px solid #00172f;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="layer-toggle" data-layer="floodedArea_19_07" data-date="19_07">
          <span class="layer-name">Aktive Flut</span>
          <span class="legend-symbol-small" style="background: #3399ff; border: 2px solid #0066cc;"></span>
        </label>
        <label class="legend-item-compact">
          <input type="checkbox" class="layer-toggle" data-layer="floodTrace_19_07" data-date="19_07">
          <span class="layer-name">Überflutungsspur</span>
          <span class="legend-symbol-small" style="background: #00cccc; border: 1px solid #006666;"></span>
        </label>
      </div>
    </div>
  `;
  
  // Event Listeners für Layer-Toggles (19.07)
  content_19_07.querySelectorAll('.layer-toggle[data-date="19_07"]').forEach(function(checkbox) {
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
  content_19_07.querySelectorAll('.category-toggle[data-date="19_07"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function(e) {
      var category = this.getAttribute('data-category').replace('_19_07', '');
      
      if (category === 'buildings') {
        var subcategory = this.closest('.legend-section-compact').querySelector('.legend-subcategory-compact');
        if (this.checked) {
          map.addLayer(layerGroups_19_07.buildings);
          map.addLayer(layerGroups_19_07.facilities);
          // Setze alle Subtype-Checkboxen auf checked
          subcategory.querySelectorAll('.subtype-toggle').forEach(function(subCheckbox) {
            subCheckbox.checked = true;
            subCheckbox.dispatchEvent(new Event('change'));
          });
        } else {
          map.removeLayer(layerGroups_19_07.buildings);
          map.removeLayer(layerGroups_19_07.facilities);
          // Setze alle Subtype-Checkboxen auf unchecked
          subcategory.querySelectorAll('.subtype-toggle').forEach(function(subCheckbox) {
            subCheckbox.checked = false;
            subCheckbox.dispatchEvent(new Event('change'));
          });
        }
      } else if (category === 'transportation') {
        var subcategory = this.closest('.legend-section-compact').querySelector('.legend-subcategory-compact');
        if (this.checked) {
          map.addLayer(layerGroups_19_07.transportation);
          // Setze alle Subtype-Checkboxen auf checked
          subcategory.querySelectorAll('.subtype-toggle').forEach(function(subCheckbox) {
            subCheckbox.checked = true;
            subCheckbox.dispatchEvent(new Event('change'));
          });
        } else {
          map.removeLayer(layerGroups_19_07.transportation);
          // Setze alle Subtype-Checkboxen auf unchecked
          subcategory.querySelectorAll('.subtype-toggle').forEach(function(subCheckbox) {
            subCheckbox.checked = false;
            subCheckbox.dispatchEvent(new Event('change'));
          });
        }
      } else if (category === 'flood') {
        var subcategory = this.closest('.legend-section-compact').querySelector('.legend-subcategory-compact');
        subcategory.querySelectorAll('.layer-toggle').forEach(function(subCheckbox) {
          if (this.checked) {
            subCheckbox.checked = true;
            subCheckbox.dispatchEvent(new Event('change'));
          } else {
            subCheckbox.checked = false;
            subCheckbox.dispatchEvent(new Event('change'));
          }
        }.bind(this));
      } else if (category === 'aoi') {
        var subcategory = this.closest('.legend-section-compact').querySelector('.legend-subcategory-compact');
        subcategory.querySelectorAll('.layer-toggle').forEach(function(subCheckbox) {
          if (this.checked) {
            subCheckbox.checked = true;
            subCheckbox.dispatchEvent(new Event('change'));
          } else {
            subCheckbox.checked = false;
            subCheckbox.dispatchEvent(new Event('change'));
          }
        }.bind(this));
      }
      e.stopPropagation();
    });
  });

  // Subtype-Toggles für Gebäudeschäden (19.07)
  content_19_07.querySelectorAll('.subtype-toggle[data-date="19_07"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function(e) {
      var type = this.getAttribute('data-type');
      var group = this.getAttribute('data-group');
      var checked = this.checked;
      
      if (group === 'combined') {
        // Stelle sicher, dass die LayerGroups zur Karte hinzugefügt sind
        if (!map.hasLayer(layerGroups_19_07.buildings)) {
          map.addLayer(layerGroups_19_07.buildings);
        }
        if (!map.hasLayer(layerGroups_19_07.facilities)) {
          map.addLayer(layerGroups_19_07.facilities);
        }
        
        // Verwende gespeicherte Layer-Arrays
        var buildingLayers = allLayersByGroup_19_07.buildings || [];
        var facilityLayers = allLayersByGroup_19_07.facilities || [];
        
        buildingLayers.forEach(function(layer) {
          if (layer.feature && layer.feature.properties && layer.feature.properties.damage_gra === type) {
            if (checked) {
              if (!layerGroups_19_07.buildings.hasLayer(layer)) {
                layerGroups_19_07.buildings.addLayer(layer);
              }
            } else {
              if (layerGroups_19_07.buildings.hasLayer(layer)) {
                layerGroups_19_07.buildings.removeLayer(layer);
              }
            }
          }
        });
        
        facilityLayers.forEach(function(layer) {
          if (layer.feature && layer.feature.properties && layer.feature.properties.damage_gra === type) {
            if (checked) {
              if (!layerGroups_19_07.facilities.hasLayer(layer)) {
                layerGroups_19_07.facilities.addLayer(layer);
              }
            } else {
              if (layerGroups_19_07.facilities.hasLayer(layer)) {
                layerGroups_19_07.facilities.removeLayer(layer);
              }
            }
          }
        });
      } else {
        // Für andere Gruppen (transportation)
        if (!map.hasLayer(layerGroups_19_07[group])) {
          map.addLayer(layerGroups_19_07[group]);
        }
        
        var layersToFilter = allLayersByGroup_19_07[group] || [];
        
        layersToFilter.forEach(function(layer) {
          if (layer.feature && layer.feature.properties && layer.feature.properties.damage_gra === type) {
            if (checked) {
              if (!layerGroups_19_07[group].hasLayer(layer)) {
                layerGroups_19_07[group].addLayer(layer);
              }
            } else {
              if (layerGroups_19_07[group].hasLayer(layer)) {
                layerGroups_19_07[group].removeLayer(layer);
              }
            }
          }
        });
      }
      
      e.stopPropagation();
    });
  });

  // Toggle Icons für Unterkategorien (19.07)
  content_19_07.querySelectorAll('.legend-category-compact').forEach(function(category) {
    category.addEventListener('click', function(e) {
      if (e.target.classList.contains('toggle-icon-small') || e.target.tagName === 'STRONG') {
        var icon = this.querySelector('.toggle-icon-small');
        var subcategory = this.parentElement.querySelector('.legend-subcategory-compact');
        if (subcategory) {
          if (subcategory.style.display === 'none' || subcategory.style.display === '') {
            subcategory.style.display = 'block';
            icon.textContent = '▼';
          } else {
            subcategory.style.display = 'none';
            icon.textContent = '▶';
          }
        }
      }
    });
  });
}