// ============================================
// AHRTAL FLUTKATASTROPHE - ZUSAETZLICHE LAYER
// Ueberschwemmungsgebiet (Hochwasserlinie)
// ============================================

/**
 * Laedt zusaetzliche Kartenlayer fuer die Ahrtal-Flutkatastrophe:
 * - Ueberschwemmungsgebiet (UESG) Ahr
 * 
 * Datenquellen:
 * - Geoportal RLP / SGD Nord
 * 
 * HINWEIS: DOP40 Luftbilder werden jetzt als Base Layer in app.js geladen
 */

function loadAhrtalLayers(map, allLayers) {
  console.log('[Ahrtal] Lade Hochwasserlinie...');
  
  // ============================================
  // UEBERSCHWEMMUNGSGEBIET (UESG) AHR
  // ============================================
  
  // Speichere Map-Referenz global fuer spaetere Verwendung
  window.ahrtalMap = map;
  
  // Lade UESG-Daten aus lokaler JSON-Datei
  loadUESGDataFromFile(map, allLayers);
  
  console.log('[Ahrtal] Ahrtal-Layer erfolgreich initialisiert');
}

// ============================================
// UESG-DATEN AUS LOKALER JSON-DATEI LADEN
// ============================================

function loadUESGDataFromFile(map, allLayers) {
  console.log('[UESG] Lade Ueberschwemmungsgebiet-Daten aus lokaler Datei...');
  
  // Lade lokale JSON-Datei
  fetch('uesg_ahr.json')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('UESG JSON-Datei nicht gefunden: ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      console.log('[UESG] Daten erfolgreich geladen:', data);
      
      // Die Datei enthaelt ein einzelnes Feature, konvertiere zu FeatureCollection
      var featureCollection = {
        type: 'FeatureCollection',
        features: [data]
      };
      
      // Erstelle GeoJSON Layer
      var uesgLayer = L.geoJSON(featureCollection, {
        style: function(feature) {
          return {
            color: 'rgb(11, 28, 23)',
            weight: 1,
            opacity: 0.8,
            fillColor: '#00ffb37b',
            fillOpacity: 0.3
          };
        },
        onEachFeature: function(feature, layer) {
          var props = feature.properties || {};
          var popupContent = '<div style="font-family: Arial; font-size: 12px;">';
          popupContent += '<strong>Ueberschwemmungsgebiet Ahr</strong><br>';
          popupContent += '<em>' + (props.STAND_BEZ || 'Vorlaeufig sichergestellt') + '</em><br><br>';
          
          if (props.GEW_NAME) {
            popupContent += '<strong>Gewaesser:</strong> ' + props.GEW_NAME + '<br>';
          }
          if (props.HQ) {
            popupContent += '<strong>Bemessungshochwasser:</strong> HQ ' + props.HQ + '<br>';
          }
          if (props.RVO_DATUM) {
            popupContent += '<strong>Datum:</strong> ' + props.RVO_DATUM + '<br>';
          }
          if (props.STRECKE) {
            popupContent += '<strong>Strecke:</strong> ' + props.STRECKE + '<br>';
          }
          
          popupContent += '<br><small>Datenquelle: <a href="https://sgdnord.rlp.de" target="_blank">SGD Nord RLP</a></small>';
          popupContent += '</div>';
          
          layer.bindPopup(popupContent);
        }
      });
      
      // Speichere Layer global
      window.uesgAhrLayer = uesgLayer;
      allLayers.push(uesgLayer);
      
      // Fuege zur Legende hinzu
      addUESGToLegend(map);
      
      console.log('[UESG] Layer erfolgreich erstellt und zur Legende hinzugefuegt');
    })
    .catch(function(error) {
      console.error('[UESG] Fehler beim Laden der lokalen Datei:', error);
      console.log('[UESG] Stelle sicher, dass uesg_ahr.json im gleichen Verzeichnis wie index.html liegt');
    });
}

// ============================================
// UESG-LAYER ZUR RECHTEN LEGENDE HINZUFUEGEN
// ============================================

function addUESGToLegend(map) {
  setTimeout(function() {
    var legendControl = document.querySelector('.custom-layer-control');
    if (!legendControl) {
      console.warn('[UESG] Keine Legende gefunden - versuche erneut...');
      // Versuche nochmal nach weiteren 500ms
      setTimeout(function() {
        var legendControl2 = document.querySelector('.custom-layer-control');
        if (!legendControl2) {
          console.error('[UESG] Legende immer noch nicht gefunden!');
          return;
        }
        addUESGSectionToControl(legendControl2, map);
      }, 500);
      return;
    }
    
    addUESGSectionToControl(legendControl, map);
  }, 800);
}

function addUESGSectionToControl(legendControl, map) {
  try {
    // Erstelle neue Sektion fuer Ueberschwemmungsgebiet
    var uesgSection = document.createElement('div');
    uesgSection.className = 'legend-date-section';
    uesgSection.innerHTML = `
      <div class="legend-date-header" style="background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; color: #ffffff;">
        <span class="section-toggle-icon">▶</span>
        <div class="date-header-content" style="flex: 1; color: #ffffff;">
          <strong style="color: #ffffff;">Jahrhunderthochwasser - Überschwemmungsgebiet</strong>
          <small style="display:block; color: #dddddd;">Veröffentlichung: 04/10/2021</small>
          <small style="display:block; color: #dddddd;">Datenquelle: SGD Nord RLP / Geoportal RLP</small>
        </div>
        <input type="checkbox" id="uesg-toggle-checkbox" class="layer-toggle" data-layer="uesg" style="width: 16px; height: 16px; margin-left: 8px; cursor: pointer;" title="Überschwemmungsgebiet ein-/ausblenden">
      </div>
      <div class="legend-date-content" id="uesg-content" style="display: none; background: rgba(0, 0, 0, 0.3);">
        <div class="legend-section-compact">
          <div class="legend-category-compact">
            <span class="toggle-icon-small">▼</span>
            <label style="flex:1;">
              <input type="checkbox" class="category-toggle" data-category="flood_uesg">
              <strong>Hydrographie (CEMS 20/07/2021)</strong>
            </label>
          </div>
          <div class="legend-subcategory-compact" data-category="flood_uesg">
            <label class="legend-item-compact">
              <input type="checkbox" class="layer-toggle" data-layer="hydrography_uesg" data-date="11_08">
              <span class="layer-name">Gewässer</span>
              <span class="legend-symbol-small" style="background: #0054a9; border: 2px solid #00172f;"></span>
            </label>
            <label class="legend-item-compact">
              <input type="checkbox" class="layer-toggle" data-layer="floodedArea_uesg" data-date="11_08">
              <span class="layer-name">Aktive Flut</span>
              <span class="legend-symbol-small" style="background: rgb(34, 84, 224); border: 2px solid rgb(0, 54, 92);"></span>
            </label>
            <label class="legend-item-compact">
              <input type="checkbox" class="layer-toggle" data-layer="floodTrace_uesg" data-date="11_08">
              <span class="layer-name">Überflutungsspur</span>
              <span class="legend-symbol-small" style="background: #0087c1; border: 2px solid #03484eff;"></span>
            </label>
          </div>
        </div>
      </div>
    `;
    
    // Fuege die Sektion NACH dem zweiten CEMS-Layer ein (am Ende)
    legendControl.appendChild(uesgSection);
    
    // Event Listener für Header (Auf-/Zuklappen)
    var uesgHeader = uesgSection.querySelector('.legend-date-header');
    var uesgContent = uesgSection.querySelector('.legend-date-content');
    var uesgToggleIcon = uesgHeader.querySelector('.section-toggle-icon');
    
    uesgHeader.addEventListener('click', function(e) {
      // Nicht ausklappen, wenn auf Checkbox geklickt wurde
      if (e.target.type === 'checkbox' || e.target.id === 'uesg-toggle-checkbox') return;
      
      if (uesgContent.style.display === 'none') {
        uesgContent.style.display = 'block';
        uesgToggleIcon.textContent = '▼';
      } else {
        uesgContent.style.display = 'none';
        uesgToggleIcon.textContent = '▶';
      }
    });
    
    // Event Listener für UESG-Checkbox (Überschwemmungsgebiet Layer ein-/ausschalten)
    var uesgCheckbox = document.getElementById('uesg-toggle-checkbox');
    if (uesgCheckbox) {
      uesgCheckbox.addEventListener('change', function(e) {
        var layer = window.uesgAhrLayer;
        var mapRef = window.ahrtalMap;
        
        if (!layer) {
          console.warn('[UESG] Layer noch nicht geladen');
          this.checked = false;
          return;
        }
        
        if (!mapRef) {
          console.warn('[UESG] Map-Referenz nicht gefunden');
          this.checked = false;
          return;
        }
        
        if (this.checked) {
          mapRef.addLayer(layer);
          console.log('[UESG] Layer eingeblendet');
        } else {
          mapRef.removeLayer(layer);
          console.log('[UESG] Layer ausgeblendet');
        }
        
        // Verhindere, dass das Event weiter propagiert und den Header aufklappt
        e.stopPropagation();
      });
    }
    
    // Event Listener für Hydrographie-Kategorie Toggle
    var floodCategoryToggle = uesgSection.querySelector('.category-toggle[data-category="flood_uesg"]');
    if (floodCategoryToggle) {
      floodCategoryToggle.addEventListener('change', function(e) {
        var mapRef = window.ahrtalMap;
        if (!mapRef) return;
        
        // Hole die Layer-Gruppen aus dem globalen Scope
        if (typeof layerGroups !== 'undefined') {
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
    }
    
    // Event Listener für einzelne Hydrographie-Layer
    uesgSection.querySelectorAll('.layer-toggle[data-layer$="_uesg"]').forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        var mapRef = window.ahrtalMap;
        if (!mapRef) return;
        
        // Hole die Layer-Gruppen aus dem globalen Scope
        if (typeof layerGroups !== 'undefined') {
          var layerName = this.getAttribute('data-layer').replace('_uesg', '');
          if (this.checked) {
            mapRef.addLayer(layerGroups[layerName]);
            console.log('[UESG] ' + layerName + ' eingeblendet');
          } else {
            mapRef.removeLayer(layerGroups[layerName]);
            console.log('[UESG] ' + layerName + ' ausgeblendet');
          }
        }
      });
    });
    
    // Toggle Icon für Hydrographie-Unterkategorie
    var floodCategory = uesgSection.querySelector('.legend-category-compact');
    if (floodCategory) {
      floodCategory.addEventListener('click', function(e) {
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
    }
    
    console.log('[UESG] Legende erfolgreich erstellt');
  } catch (error) {
    console.error('[UESG] Fehler beim Hinzufügen zur Legende:', error);
  }
}

// Exportiere die Hauptfunktion
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAhrtalLayers };
}