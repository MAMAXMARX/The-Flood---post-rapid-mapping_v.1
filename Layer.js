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
            color: '#00ffb3ff',
            weight: 2,
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
      <div class="legend-date-header" style="background: #e3f2fd; display: flex; align-items: center;">
        <div class="date-header-content" style="flex: 1;">
          <strong style="color: #0066cc;">Jahrhunderthochwasser - Erwartetes Überschwemmungsgebiet</strong>
          <small style="color: #0066cc;">Vorlaeufig sichergestellt (Par.76 Abs. 3 WHG)</small>
        </div>
        <input type="checkbox" id="uesg-toggle-checkbox" style="width: 16px; height: 16px; margin-left: 8px; cursor: pointer;">
      </div>
      <div class="legend-date-content" id="uesg-content" style="display: none;">
        <div style="margin-top: 8px; padding: 6px; background: #f5f5f5; border-radius: 4px; font-size: 10px; color: #555;">
          <strong>Hinweis:</strong><br>
          Zeigt die vorlaeufig sichergestellte Ueberschwemmungsflaeche der Ahrtal-Flut vom Juli 2021.<br><br>
          <strong>Datenquelle:</strong> <a href="https://sgdnord.rlp.de" target="_blank" style="color: #0066cc;">SGD Nord RLP</a> / 
          <a href="https://www.geoportal.rlp.de" target="_blank" style="color: #0066cc;">Geoportal RLP</a>
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