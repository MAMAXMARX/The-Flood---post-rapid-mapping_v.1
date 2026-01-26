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
        <div class="date-header-content" style="flex: 1; color: #ffffff;">
          <strong style="color: #ffffff;">Jahrhunderthochwasser - Erwartetes Überschwemmungsgebiet</strong>
          <small style="color: #dddddd;">Vorlaeufig sichergestellt (Par.76 Abs. 3 WHG)</small>
        </div>
        <input type="checkbox" id="uesg-toggle-checkbox" style="width: 16px; height: 16px; margin-left: 8px; cursor: pointer;">
      </div>
      <div class="legend-date-content" id="uesg-content" style="display: none; background: rgba(0, 0, 0, 0.3);">
        <div style="margin-top: 8px; padding: 6px; background: rgba(0, 0, 0, 0.5); border-radius: 4px; font-size: 10px; color: #dddddd; border: 1px solid #ffffff;">
          <strong style="color: #ffffff;">Hinweis:</strong><br>
          Zeigt die vorlaeufig sichergestellte Ueberschwemmungsflaeche der Ahrtal-Flut vom Juli 2021.<br><br>
          <strong style="color: #ffffff;">Datenquelle:</strong> <a href="https://sgdnord.rlp.de" target="_blank" style="color: #47a9bc;">SGD Nord RLP</a> / 
          <a href="https://www.geoportal.rlp.de" target="_blank" style="color: #47a9bc;">Geoportal RLP</a>
        </div>
      </div>
    `;
    
    // Fuege die Sektion am Anfang der Legende ein
    var firstSection = legendControl.querySelector('.legend-date-section');
    if (firstSection) {
      legendControl.insertBefore(uesgSection, firstSection);
    } else {
      legendControl.appendChild(uesgSection);
    }
    
    // Event Listener fuer Checkbox (Layer ein-/ausschalten)
    var checkbox = document.getElementById('uesg-toggle-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', function() {
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
        var infobox = document.getElementById('cems-infobox-19-07');
        if (infobox) {
          if (infobox.style.display === 'none' || infobox.style.display === '') {
            infobox.style.display = 'block';
          } else {
            infobox.style.display = 'none';
          }
        }
      });
    }

    // Erstelle die Infobox als fixed Element (NICHT als Leaflet Control)
    var infoboxDiv = document.createElement('div');
    infoboxDiv.id = 'cems-infobox-19-07';
    infoboxDiv.className = 'cems-infobox';
    
    // Setze Styles direkt inline - FIXED POSITIONING
    infoboxDiv.style.display = 'none';
    infoboxDiv.style.position = 'fixed';
    infoboxDiv.style.bottom = '20px';
    infoboxDiv.style.left = '10px';
    infoboxDiv.style.zIndex = '1000';
    infoboxDiv.style.background = 'rgba(0, 0, 0, 0.741)';
    infoboxDiv.style.padding = '0';
    infoboxDiv.style.borderRadius = '1px';
    infoboxDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    infoboxDiv.style.border = '2px solid #ffffff';
    infoboxDiv.style.width = '300px';
    infoboxDiv.style.minHeight = '150px';
    infoboxDiv.style.maxHeight = 'calc(100vh - 450px - 40px)'; // Custom Layer max-height - 20px Abstand oben/unten
    infoboxDiv.style.overflowY = 'auto';
    infoboxDiv.style.overflowX = 'hidden';
    infoboxDiv.style.fontFamily = 'Arial, sans-serif';
    infoboxDiv.style.fontSize = '12px';
    infoboxDiv.style.boxSizing = 'border-box';
    
    infoboxDiv.innerHTML = `
      <div style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <strong style="color: #47a9bc; font-size: 13px;">CEMS Rapid Mapping V.1 - 18/07/2021</strong>
          <button class="cems-infobox-close" style="background: transparent; border: none; color: #ffffff; font-size: 18px; cursor: pointer; font-weight: bold; line-height: 1; padding: 0;">×</button>
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 0; text-align: left;">
          Copernicus veröffentlichte die erste Schadensbewertung am 19. Juli 2021, vier Tage nach dem Flutereignis, und dokumentierte dabei die Lage vom 18. Juli, kurz nach dem Höhepunkt der Flutkatastrophe. Der Copernicus EMS Rapid Mapping Service wurde bereits am 13. Juli 2021 um 17:11 Uhr durch das deutsche Gemeinsame Melde- und Lagezentrum (GMLZ) aktiviert, nachdem die Region Rheinland-Pfalz von Starkregen getroffen worden war. Das Untersuchungsgebiet «AOI15» (Area of Interest 15) wurde zuvor von den zuständigen Behörden festgelegt und an Copernicus übermittelt. Dadurch analysierte das Rapid Mapping nur die Hälfte des betroffenen Gebietes. Die Erstbewertung basierte auf den ersten verfügbaren Satellitenbildern unter erschwerten Bedingungen. Dieses Produkt wurde später als «überflüssig» markiert, da eine aktualisierte Version vom 11. August 2021 verbesserte Datengrundlagen und deutlich präzisere Schadensinformationen bot.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 12px 0 0 0; text-align: left;">
          [TEST-ABSATZ] Copernicus veröffentlichte die erste Schadensbewertung am 19. Juli 2021, vier Tage nach dem Flutereignis, und dokumentierte dabei die Lage vom 18. Juli, kurz nach dem Höhepunkt der Flutkatastrophe. Der Copernicus EMS Rapid Mapping Service wurde bereits am 13. Juli 2021 um 17:11 Uhr durch das deutsche Gemeinsame Melde- und Lagezentrum (GMLZ) aktiviert.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #ffffff; margin: 12px 0 0 0; text-align: left;">
          [TEST-ABSATZ 2] Das Untersuchungsgebiet «AOI15» (Area of Interest 15) wurde zuvor von den zuständigen Behörden festgelegt und an Copernicus übermittelt. Dadurch analysierte das Rapid Mapping nur die Hälfte des betroffenen Gebietes.
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
      });
    }

    console.log('[CEMS Info] ✅ Infobox für 18/07/2021 erstellt (fixed position)');
  }, 1200);
}

// Rufe die Funktion auf
if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    addCEMSInfoBox_19_07();
  });
}