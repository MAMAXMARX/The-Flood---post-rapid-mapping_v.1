// ============================================
// BASEMAP CONTROL - RECHTE SEITE
// Auswahl der Basiskarten
// ============================================

function createBasemapControl(map, baseMaps) {
  var BasemapControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'basemap-control');
      
      // Refresh-Button als separate Box
      var refreshButton = L.DomUtil.create('div', 'basemap-refresh', container);
      refreshButton.innerHTML = '<strong>↻ Neu laden</strong>';
      refreshButton.style.cssText = 'padding: 8px; text-align: left; cursor: pointer; font-size: 12px; color: #ffffff; background: rgba(0, 0, 0, 0.741); margin-bottom: 20px; border: 2px solid #ffffff; border-radius: 1px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
      refreshButton.title = 'Seite neu laden';
      
      // Event Listener für Refresh
      L.DomEvent.on(refreshButton, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        window.location.reload();
      });
      
      // Wrapper für Karten-Box (Header + Liste)
      var kartenBox = L.DomUtil.create('div', 'basemap-karten-box', container);
      kartenBox.style.cssText = 'background: rgba(0, 0, 0, 0.741); border: 2px solid #ffffff; border-radius: 1px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); overflow: hidden;';
      
      // Header mit Toggle-Icon
      var header = L.DomUtil.create('div', 'basemap-header', kartenBox);
      header.innerHTML = '<span class="basemap-toggle-icon">▼</span><strong>Karten</strong>';
      header.style.cursor = 'pointer';
      header.title = 'Ein-/Ausklappen';
      
      // Liste (scrollbar)
      var liste = L.DomUtil.create('div', 'basemap-liste', kartenBox);
      
      // Basemaps mit besserem Namen
      var basemapNames = {
        "Satellit (Esri)": "ESRI Satellit",
        "Google Satellit": "Google Satellit",
        "CartoDB Voyager": "CartoDB Voyager",
        "Humanitarian": "Humanitarian"
      };
      
      // Sortierung: ESRI, Google, CartoDB, Humanitarian
      var sortedBasemaps = [
        "Satellit (Esri)",
        "Google Satellit",
        "CartoDB Voyager",
        "Humanitarian"
      ];
      
      var lastSelectedLayer = null;
      
      sortedBasemaps.forEach(function(originalName) {
        if (!baseMaps[originalName]) return;
        
        var displayName = basemapNames[originalName];
        var layer = baseMaps[originalName];
        
        var item = L.DomUtil.create('div', 'basemap-item', liste);
        item.innerHTML = displayName;
        item.title = 'Wechseln zu ' + displayName;
        item.dataset.layerName = originalName;
        
        // Check if this is the currently active layer
        if (map.hasLayer(layer)) {
          item.classList.add('active');
          lastSelectedLayer = layer;
        }
        
        // Click Event
        L.DomEvent.on(item, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          
          // Remove all active states
          liste.querySelectorAll('.basemap-item').forEach(function(i) {
            i.classList.remove('active');
          });
          
          // Deaktiviere alte Basemap
          if (lastSelectedLayer && map.hasLayer(lastSelectedLayer)) {
            map.removeLayer(lastSelectedLayer);
          }
          
          // Aktiviere neue Basemap
          map.addLayer(layer);
          lastSelectedLayer = layer;
          item.classList.add('active');
          
          console.log('🗺️ Basemap gewechselt zu: ' + displayName);
        });
      });
      
      // Monochrome Filter Option
      var monochromeItem = L.DomUtil.create('div', 'basemap-item basemap-filter', liste);
      monochromeItem.innerHTML = '<input type="checkbox" id="monochromeToggle" checked style="margin-right: 6px; cursor: pointer;">Filter';
      monochromeItem.style.display = 'flex';
      monochromeItem.style.alignItems = 'center';
      monochromeItem.style.borderTop = '1px solid #ffffff';
      monochromeItem.style.paddingTop = '8px';
      monochromeItem.style.marginTop = '4px';
      
      var monochromeCheckbox = monochromeItem.querySelector('#monochromeToggle');
      L.DomEvent.on(monochromeCheckbox, 'change', function(e) {
        L.DomEvent.stopPropagation(e);
        var mapElement = document.getElementById('map');
        if (this.checked) {
          mapElement.classList.add('monochrome');
        } else {
          mapElement.classList.remove('monochrome');
        }
      });
      
      // Verhindere, dass Klick auf Checkbox den Filter umschaltet
      L.DomEvent.on(monochromeItem, 'click', function(e) {
        if (e.target.type !== 'checkbox') {
          L.DomEvent.stopPropagation(e);
          monochromeCheckbox.checked = !monochromeCheckbox.checked;
          monochromeCheckbox.dispatchEvent(new Event('change'));
        }
      });
      
      // Toggle Funktion für Header
      var isCollapsed = false;
      L.DomEvent.on(header, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        
        if (isCollapsed) {
          liste.style.display = 'block';
          header.querySelector('.basemap-toggle-icon').textContent = '▼';
          isCollapsed = false;
        } else {
          liste.style.display = 'none';
          header.querySelector('.basemap-toggle-icon').textContent = '▶';
          isCollapsed = true;
        }
      });
      
      // Verhindere Map-Events beim Interagieren mit Control
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      return container;
    }
  });
  
  new BasemapControl().addTo(map);
  console.log('✅ Basemap-Control geladen (rechts, collapsible)');
}