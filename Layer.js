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
      <div class="legend-date-header" data-section="uesg" style="background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; color: #ffffff;">
        <span class="section-toggle-icon">▶</span>
        <div class="date-header-content" style="flex: 1; color: #ffffff;">
          <strong style="color: #ffffff;">Jahrhunderthochwasser - Erwartetes Überschwemmungsgebiet</strong>
          <small style="display:block; color: #dddddd;">Veröffentlichung: 04/10/2021</small>
          <small style="display:block; color: #dddddd;">Datenquelle: SGD Nord RLP / Geoportal RLP</small>
        </div>
        <input type="checkbox" id="uesg-toggle-checkbox" class="section-layer-toggle" data-section="uesg" data-layer="uesg" style="width: 16px; height: 16px; margin-left: 8px; cursor: pointer;" title="Überschwemmungsgebiet ein-/ausblenden">
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
    
    // Fuege die Sektion AM ENDE der Legende ein (nach allen CEMS Layern)
    legendControl.appendChild(uesgSection);
    
    // Event Listener für Header (Auf-/Zuklappen)
    var uesgHeader = uesgSection.querySelector('.legend-date-header');
    var uesgContent = uesgSection.querySelector('.legend-date-content');
    var uesgToggleIcon = uesgHeader.querySelector('.section-toggle-icon');
    
    uesgHeader.addEventListener('click', function(e) {
      // Nicht ausklappen, wenn auf Checkbox oder Info-Icon geklickt wurde
      if (e.target.type === 'checkbox' || e.target.id === 'uesg-toggle-checkbox' || e.target.classList.contains('cems-info-button-uesg')) return;
      
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

// ============================================
// CEMS INFOBOX - 18/07/2021
// ============================================

function addCEMSInfoBox_19_07() {
  setTimeout(function() {
    // Finde den ersten CEMS Header (19_07)
    var cemsHeader = document.querySelector('.legend-date-header[data-section="19_07"]');
    if (!cemsHeader) {
      console.warn('[CEMS Info] CEMS Header nicht gefunden');
      return;
    }

    // Erstelle Container für Icon ÜBER der Checkbox
    var checkbox = cemsHeader.querySelector('.section-layer-toggle');
    if (checkbox) {
      // Wrapper für Icon und Checkbox (vertikal gestapelt)
      var iconCheckboxWrapper = document.createElement('div');
      iconCheckboxWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px; margin-left: 8px;';
      
      var infoIcon = document.createElement('button');
      infoIcon.className = 'cems-info-button-19-07';
      infoIcon.innerHTML = 'ℹ';
      infoIcon.style.cssText = 'background: transparent; border: 2px solid #ffffff; color: #ffffff; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; padding: 0; flex-shrink: 0; margin: 0; margin-bottom: 2px;';
      infoIcon.title = 'Informationen';
      
      // Entferne Checkbox aus Header
      cemsHeader.removeChild(checkbox);
      
      // Entferne margin/padding von Checkbox für perfekte Ausrichtung
      checkbox.style.margin = '0';
      checkbox.style.padding = '0';
      
      // Füge Icon und Checkbox in Wrapper ein
      iconCheckboxWrapper.appendChild(infoIcon);
      iconCheckboxWrapper.appendChild(checkbox);
      
      // Füge Wrapper zum Header hinzu
      cemsHeader.appendChild(iconCheckboxWrapper);
      
      // Event Listener für Info-Icon
      infoIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Schließe ALLE anderen Infoboxen
        closeAllInfoboxes();
        
        var infobox = document.getElementById('cems-infobox-19-07');
        if (infobox) {
          if (infobox.style.display === 'none' || infobox.style.display === '') {
            infobox.style.display = 'block';
            // Färbe Header hellblau wenn Infobox geöffnet
            cemsHeader.style.background = 'rgba(71, 169, 188, 0.557)';
          } else {
            infobox.style.display = 'none';
            // Entferne hellblauen Hintergrund wenn Infobox geschlossen
            cemsHeader.style.background = '';
          }
        }
      });
    }

    // Erstelle die Infobox als fixed Element (NICHT als Leaflet Control)
    var infoboxDiv = document.createElement('div');
    infoboxDiv.id = 'cems-infobox-19-07';
    infoboxDiv.className = 'cems-infobox leaflet-control';
    
    // Setze Styles direkt inline - FIXED POSITIONING
    infoboxDiv.style.display = 'none';
    infoboxDiv.style.position = 'fixed';
    infoboxDiv.style.bottom = '28px';
    infoboxDiv.style.left = '28px';
    infoboxDiv.style.zIndex = '1000';
    infoboxDiv.style.background = 'rgba(0, 0, 0, 0.741)';
    infoboxDiv.style.padding = '0';
    infoboxDiv.style.borderRadius = '1px';
    infoboxDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    infoboxDiv.style.border = '2px solid #ffffff';
    infoboxDiv.style.width = '300px';
    infoboxDiv.style.minHeight = '150px';
    infoboxDiv.style.maxHeight = '300px';
    infoboxDiv.style.overflowY = 'auto';
    infoboxDiv.style.overflowX = 'hidden';
    infoboxDiv.style.fontFamily = 'Arial, sans-serif';
    infoboxDiv.style.fontSize = '12px';
    infoboxDiv.style.boxSizing = 'border-box';
    infoboxDiv.style.marginLeft = '0px';
    
    infoboxDiv.innerHTML = `
      <div style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <strong style="color: #47a9bc; font-size: 13px;">CEMS Rapid Mapping V.1 - 18/07/2021</strong>
          <button class="cems-infobox-close" style="background: transparent; border: none; color: #ffffff; font-size: 18px; cursor: pointer; font-weight: bold; line-height: 1; padding: 0;">×</button>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 0; text-align: left;">
          Copernicus veröffentlichte die erste Schadensbewertung am 19. Juli 2021, vier Tage nach dem Flutereignis, und dokumentierte dabei die Lage vom 18. Juli, kurz nach dem Höhepunkt der Flutkatastrophe. Der Copernicus EMS Rapid Mapping Service wurde bereits am 13. Juli 2021 um 17:11 Uhr durch das deutsche Gemeinsame Melde- und Lagezentrum (GMLZ) aktiviert, nachdem die Region Rheinland-Pfalz von Starkregen getroffen worden war. Das Untersuchungsgebiet «AOI15» (Area of Interest 15) wurde zuvor von den zuständigen Behörden festgelegt und an Copernicus übermittelt. Dadurch analysierte das Rapid Mapping nur die Hälfte des betroffenen Gebietes. Die Erstbewertung basierte auf den ersten verfügbaren Satellitenbildern unter erschwerten Bedingungen. Dieses Produkt wurde später als «überflüssig» markiert, da eine aktualisierte Version vom 11. August 2021 verbesserte Datengrundlagen und deutlich präzisere Schadensinformationen bot.
        </p>
      </div>
    `;

    // Füge Infobox direkt zum body hinzu (NICHT als Leaflet Control)
    document.body.appendChild(infoboxDiv);

    // Event Listener für Close-Button
    var closeButton = infoboxDiv.querySelector('.cems-infobox-close');
    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        infoboxDiv.style.display = 'none';
        // Entferne hellblauen Hintergrund vom Header
        var cemsHeader = document.querySelector('.legend-date-header[data-section="19_07"]');
        if (cemsHeader) {
          cemsHeader.style.background = '';
        }
      });
    }

    console.log('[CEMS Info] ✅ Infobox für 18/07/2021 erstellt (fixed position)');
  }, 1200);
}

// Rufe die Funktion auf
if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    addCEMSInfoBox_19_07();
    addCEMSInfoBox_11_08();
    addUESGInfoBox();
  });
}

// ============================================
// UESG INFOBOX - Jahrhunderthochwasser
// ============================================

function addUESGInfoBox() {
  setTimeout(function() {
    // Finde den UESG Header
    var uesgHeader = document.querySelector('.legend-date-header[data-section="uesg"]');
    if (!uesgHeader) {
      console.warn('[UESG Info] UESG Header nicht gefunden');
      return;
    }

    // Füge Info-Icon zum Header hinzu
    var checkbox = uesgHeader.querySelector('.section-layer-toggle');
    if (checkbox) {
      // Wrapper für Icon und Checkbox (vertikal gestapelt)
      var iconCheckboxWrapper = document.createElement('div');
      iconCheckboxWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px; margin-left: 8px;';
      
      var infoIcon = document.createElement('button');
      infoIcon.className = 'cems-info-button-uesg';
      infoIcon.innerHTML = 'ℹ';
      infoIcon.style.cssText = 'background: transparent; border: 2px solid #ffffff; color: #ffffff; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; padding: 0; flex-shrink: 0; margin: 0; margin-bottom: 2px;';
      infoIcon.title = 'Informationen';
      
      // Entferne Checkbox aus Header
      uesgHeader.removeChild(checkbox);
      
      // Entferne margin/padding von Checkbox
      checkbox.style.margin = '0';
      checkbox.style.padding = '0';
      
      // Füge Icon und Checkbox in Wrapper ein
      iconCheckboxWrapper.appendChild(infoIcon);
      iconCheckboxWrapper.appendChild(checkbox);
      
      // Füge Wrapper zum Header hinzu
      uesgHeader.appendChild(iconCheckboxWrapper);
      
      // Event Listener für Info-Icon
      infoIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Schließe ALLE anderen Infoboxen
        closeAllInfoboxes();
        
        var infobox = document.getElementById('cems-infobox-uesg');
        if (infobox) {
          if (infobox.style.display === 'none' || infobox.style.display === '') {
            infobox.style.display = 'block';
            // Färbe Header hellblau wenn Infobox geöffnet
            uesgHeader.style.background = 'rgba(71, 169, 188, 0.557)';
          } else {
            infobox.style.display = 'none';
            // Entferne hellblauen Hintergrund wenn Infobox geschlossen
            uesgHeader.style.background = '';
          }
        }
      });
    }

    // Erstelle die Infobox als fixed Element
    var infoboxDiv = document.createElement('div');
    infoboxDiv.id = 'cems-infobox-uesg';
    infoboxDiv.className = 'cems-infobox leaflet-control';
    
    // Setze Styles direkt inline - FIXED POSITIONING
    infoboxDiv.style.display = 'none';
    infoboxDiv.style.position = 'fixed';
    infoboxDiv.style.bottom = '28px';
    infoboxDiv.style.left = '28px';
    infoboxDiv.style.zIndex = '1000';
    infoboxDiv.style.background = 'rgba(0, 0, 0, 0.741)';
    infoboxDiv.style.padding = '0';
    infoboxDiv.style.borderRadius = '1px';
    infoboxDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    infoboxDiv.style.border = '2px solid #ffffff';
    infoboxDiv.style.width = '300px';
    infoboxDiv.style.minHeight = '150px';
    infoboxDiv.style.maxHeight = '300px';
    infoboxDiv.style.overflowY = 'auto';
    infoboxDiv.style.overflowX = 'hidden';
    infoboxDiv.style.fontFamily = 'Arial, sans-serif';
    infoboxDiv.style.fontSize = '12px';
    infoboxDiv.style.boxSizing = 'border-box';
    infoboxDiv.style.marginLeft = '0px';
    
    infoboxDiv.innerHTML = `
      <div style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <strong style="color: #47a9bc; font-size: 13px;">JAHRHUNDERTHOCHWASSER</strong>
          <button class="cems-infobox-close" data-target="uesg" style="background: transparent; border: none; color: #ffffff; font-size: 18px; cursor: pointer; font-weight: bold; line-height: 1; padding: 0;">×</button>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 0 0 12px 0; text-align: left;">
          Am 4. Oktober 2021, drei Monate nach der Flutkatastrophe, hat die Struktur- und Genehmigungsdirektion Nord (SGD Nord) Rheinland-Pfalz das folgende Gebiet als «vorläufig sichergestelltes Überschwemmungsgebiet» gemäß § 76 Abs. 3 des Wasserhaushaltsgesetzes (WHG) festgesetzt. Die Erhebung erfolgte durch eine hydrologische Modellierung des HQ100-Abflusses (100-jährliches Hochwasser) unter Verwendung digitaler Geländemodelle sowie durch hydraulische Berechnungen der Überflutungsflächen.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 0; text-align: left;">
          Die ÜESG-Daten zeigen nicht die tatsächliche Überflutung vom Juli 2021, sondern das rechtlich festgesetzte Schutzgebiet für die zukünftige Bauplanung und den Hochwasserschutz. Die Flut vom Juli 2021 war ein Ereignis, das statistisch gesehen seltener als alle 1000 Jahre auftritt, während das rechtliche Überschwemmungsgebiet auf einem Jahrhunderthochwasser basiert. Durch das Übereinanderlegen der ÜESG-Hochwasserlinie und der von Copernicus Rapid Mapping festgestellten Überflutungsspur ergibt sich eine vage Vorstellung davon, wie hoch das Wasser während des Krisenereignisses gestanden haben muss.
        </p>
      </div>
    `;

    // Füge Infobox direkt zum body hinzu
    document.body.appendChild(infoboxDiv);

    // Event Listener für Close-Button
    var closeButton = infoboxDiv.querySelector('.cems-infobox-close');
    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        infoboxDiv.style.display = 'none';
        // Entferne hellblauen Hintergrund vom Header
        if (uesgHeader) {
          uesgHeader.style.background = '';
        }
      });
    }

    console.log('[UESG Info] ✅ Infobox für Jahrhunderthochwasser erstellt (fixed position)');
  }, 1500); // Etwas später, damit UESG-Sektion sicher geladen ist
}

// ============================================
// CEMS INFOBOX - 20/07/2021 (zweiter Layer)
// ============================================

function addCEMSInfoBox_11_08() {
  setTimeout(function() {
    // Finde den zweiten CEMS Header (11_08)
    var cemsHeader = document.querySelector('.legend-date-header[data-section="11_08"]');
    if (!cemsHeader) {
      console.warn('[CEMS Info] CEMS Header 11_08 nicht gefunden');
      return;
    }

    // Erstelle Container für Icon ÜBER der Checkbox
    var checkbox = cemsHeader.querySelector('.section-layer-toggle');
    if (checkbox) {
      // Wrapper für Icon und Checkbox (vertikal gestapelt)
      var iconCheckboxWrapper = document.createElement('div');
      iconCheckboxWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px; margin-left: 8px;';
      
      var infoIcon = document.createElement('button');
      infoIcon.className = 'cems-info-button-11-08';
      infoIcon.innerHTML = 'ℹ';
      infoIcon.style.cssText = 'background: transparent; border: 2px solid #ffffff; color: #ffffff; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; padding: 0; flex-shrink: 0; margin: 0; margin-bottom: 2px;';
      infoIcon.title = 'Informationen';
      
      // Entferne Checkbox aus Header
      cemsHeader.removeChild(checkbox);
      
      // Entferne margin/padding von Checkbox für perfekte Ausrichtung
      checkbox.style.margin = '0';
      checkbox.style.padding = '0';
      
      // Füge Icon und Checkbox in Wrapper ein
      iconCheckboxWrapper.appendChild(infoIcon);
      iconCheckboxWrapper.appendChild(checkbox);
      
      // Füge Wrapper zum Header hinzu
      cemsHeader.appendChild(iconCheckboxWrapper);
      
      // Event Listener für Info-Icon
      infoIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Schließe ALLE anderen Infoboxen
        closeAllInfoboxes();
        
        var infobox = document.getElementById('cems-infobox-11-08');
        if (infobox) {
          if (infobox.style.display === 'none' || infobox.style.display === '') {
            infobox.style.display = 'block';
            // Färbe Header hellblau wenn Infobox geöffnet
            cemsHeader.style.background = 'rgba(71, 169, 188, 0.557)';
          } else {
            infobox.style.display = 'none';
            // Entferne hellblauen Hintergrund wenn Infobox geschlossen
            cemsHeader.style.background = '';
          }
        }
      });
    }

    // Erstelle die Infobox als fixed Element
    var infoboxDiv = document.createElement('div');
    infoboxDiv.id = 'cems-infobox-11-08';
    infoboxDiv.className = 'cems-infobox leaflet-control';
    
    // Setze Styles direkt inline - FIXED POSITIONING
    infoboxDiv.style.display = 'none';
    infoboxDiv.style.position = 'fixed';
    infoboxDiv.style.bottom = '28px';
    infoboxDiv.style.left = '28px';
    infoboxDiv.style.zIndex = '1000';
    infoboxDiv.style.background = 'rgba(0, 0, 0, 0.741)';
    infoboxDiv.style.padding = '0';
    infoboxDiv.style.borderRadius = '1px';
    infoboxDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    infoboxDiv.style.border = '2px solid #ffffff';
    infoboxDiv.style.width = '300px';
    infoboxDiv.style.minHeight = '150px';
    infoboxDiv.style.maxHeight = '300px';
    infoboxDiv.style.overflowY = 'auto';
    infoboxDiv.style.overflowX = 'hidden';
    infoboxDiv.style.fontFamily = 'Arial, sans-serif';
    infoboxDiv.style.fontSize = '12px';
    infoboxDiv.style.boxSizing = 'border-box';
    infoboxDiv.style.marginLeft = '0px';
    
    infoboxDiv.innerHTML = `
      <div style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <strong style="color: #47a9bc; font-size: 13px;">CEMS Rapid Mapping V.3 - 20/07/2021</strong>
          <button class="cems-infobox-close" data-target="11_08" style="background: transparent; border: none; color: #ffffff; font-size: 18px; cursor: pointer; font-weight: bold; line-height: 1; padding: 0;">×</button>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 0; text-align: left;">
          Die überarbeitete Schadensbewertung vom 11. August 2021 visualisiert die Ortssituation vom 20. Juli und stellt die finale Kartierung für das Untersuchungsgebiet AOI15 dar. In dieser wurde die «Area of Interest» nun auch auf den gesamten Verlauf von Müsch bis zum Rhein erweitert. Trotz der deutlich detaillierteren Schadensanalyse im Vergleich zur Vorgängerversion enthält diese noch eine Vielzahl nicht identifizierter Bereiche, sogenannte «Blind Spots». Vor allem die Hydrographie ist stark fragmentiert, insbesondere in nicht urbanisierten Bereichen. Diese stellen im Vergleich zu den urbanisierten Räumen während des Krisenereignisses zwar eine geringere Priorität dar, sind für langfristige Untersuchungen jedoch relevant, um zu erfassen, welche Räume durch die Flut maßgeblich beeinflusst wurden und welche Folgen sich für das Ökosystem im Ahrtal ergeben. Die bereitgestellten Daten müssen gleichzeitig auch kritisch betrachtet werden und dürfen nicht als absolute Wahrheit angesehen werden. Das Copernicus Emergency Management System bietet zwar eine umfassende Einschätzung der Ortssituation, stellt jedoch zugleich ein operatives Bild dar. Erst durch die Ergänzung von Daten der Bodenwirklichkeit, der sogenannten «Ground Truth», können Fernerkundungsdaten präziser klassifiziert werden, um die bereitgestellten Daten auf ihre Korrektheit zu prüfen. So suggeriert das Rapid Mapping beispielsweise für den Ort Bad Bodendorf eine falsche Interpretation der Ortssituation. Die Tatsache, dass in diesem Gebiet durch Wolkenbedeckung weder eine Kartierung der Hydrographie noch der Infrastruktur und Gebäude vorgenommen wurde, lässt auf den ersten Blick vermuten, dass das Gebiet vom Flutereignis verschont geblieben ist. Fehleinschätzungen aufgrund von nicht identifizierbaren Bereichen und dadurch fehlenden Interpretationen können fatale Folgen für betroffene Anwohner*innen bedeuten, wenn sich Einsatzkräfte ausschließlich auf dieses System verlassen.
        </p>
      </div>
    `;

    // Füge Infobox direkt zum body hinzu
    document.body.appendChild(infoboxDiv);

    // Event Listener für Close-Button
    var closeButton = infoboxDiv.querySelector('.cems-infobox-close');
    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        infoboxDiv.style.display = 'none';
        // Entferne hellblauen Hintergrund vom Header
        var cemsHeader = document.querySelector('.legend-date-header[data-section="11_08"]');
        if (cemsHeader) {
          cemsHeader.style.background = '';
        }
      });
    }

    console.log('[CEMS Info] ✅ Infobox für 20/07/2021 erstellt (fixed position)');
  }, 1200);
}

// Hilfsfunktion: Schließe alle Infoboxen
function closeAllInfoboxes() {
  // Schließe 19_07 Infobox
  var infobox1 = document.getElementById('cems-infobox-19-07');
  if (infobox1) {
    infobox1.style.display = 'none';
  }
  var header1 = document.querySelector('.legend-date-header[data-section="19_07"]');
  if (header1) {
    header1.style.background = '';
  }
  
  // Schließe 11_08 Infobox
  var infobox2 = document.getElementById('cems-infobox-11-08');
  if (infobox2) {
    infobox2.style.display = 'none';
  }
  var header2 = document.querySelector('.legend-date-header[data-section="11_08"]');
  if (header2) {
    header2.style.background = '';
  }
  
  // Schließe UESG Infobox
  var infobox3 = document.getElementById('cems-infobox-uesg');
  if (infobox3) {
    infobox3.style.display = 'none';
  }
  // Finde UESG Header (der erste Header ohne data-section)
  var headers = document.querySelectorAll('.legend-date-header');
  headers.forEach(function(h) {
    if (h.textContent.includes('Jahrhunderthochwasser')) {
      h.style.background = '';
    }
  });
}