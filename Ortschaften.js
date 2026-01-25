// ============================================
// ORTSCHAFTEN CONTROL - RECHTE SEITE
// Navigation zu Orten im Ahrtal
// ============================================

var ortschaften = [
  { name: "Altenahr", lat: 50.51644591843296, lon: 6.988105118535847, zoom: 16 },
  { name: "Altenburg", lat: 50.510738708680414, lon: 6.987212599234379, zoom: 16 },
  { name: "Antweiler", lat: 50.406247945467776, lon: 6.831230162425697, zoom: 16 },
  { name: "Bachem", lat: 50.53996769301483, lon: 7.112306853918992, zoom: 16 },
  { name: "Bad Bollendorf", lat: 49.8561, lon: 6.3539, zoom: 16 },
  { name: "Bad Neuenahr-Ahrweiler", lat: 50.5428, lon: 7.1250, zoom: 14 },
  { name: "Dernau", lat: 50.5314, lon: 7.0281, zoom: 16 },
  { name: "Dorsel", lat: 50.379109566662365, lon: 6.7925836315394985, zoom: 16 },
  { name: "Dümpelfeld", lat: 50.44321265785733, lon: 6.933453079604261, zoom: 16 },
  { name: "Fuchshofen", lat: 50.428974924075796, lon: 6.851724822226104, zoom: 16 },
  { name: "Heimersheim", lat: 50.54499232623629, lon: 7.177233914182003, zoom: 16 },
  { name: "Hönningen", lat: 50.47269107559704, lon: 6.954470296464959, zoom: 16 },
  { name: "Insul", lat: 50.4408717977594, lon: 6.9141474223081625, zoom: 16 },
  { name: "Kreuzberg", lat: 50.5082000679269, lon: 6.9763201233893275, zoom: 16 },
  { name: "Brück", lat: 50.48770620775788, lon: 6.971428644357829, zoom: 16 },
  { name: "Liers", lat: 50.45714754730591, lon: 6.942851371228653, zoom: 16 },
  { name: "Mayschoß", lat: 50.52207363618087, lon: 7.018882435222987, zoom: 16 },
  { name: "Müsch", lat: 50.387599104247684, lon: 6.829835767711275, zoom: 16 },
  { name: "Pützfeld", lat: 50.492032337654564, lon: 6.9820030259512045, zoom: 16 },
  { name: "Rech", lat: 50.51318539244252, lon: 7.037544741148802, zoom: 16 },
  { name: "Reimerzhoven", lat: 50.52000918143945, lon: 7.00520295507729, zoom: 16 },
  { name: "Schuld", lat: 50.44755406075322, lon: 6.8860511604146595, zoom: 16 },
  { name: "Sinzig", lat: 50.546522798525885, lon: 7.248088946651728, zoom: 14 },
  { name: "Waldporzheim", lat: 50.531438134687996, lon: 7.078969648903889, zoom: 16 }
];

function createOrtschaftenControl(map) {
  var OrtschaftenControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'ortschaften-control');
      
      // Header mit Toggle-Icon
      var header = L.DomUtil.create('div', 'ortschaften-header', container);
      header.innerHTML = '<span class="ortschaften-toggle-icon">▼</span><strong>Ortschaften</strong>';
      header.style.cursor = 'pointer';
      header.title = 'Ein-/Ausklappen';
      
      // Liste (scrollbar)
      var liste = L.DomUtil.create('div', 'ortschaften-liste', container);
      
      ortschaften.forEach(function(ort) {
        var item = L.DomUtil.create('div', 'ortschaften-item', liste);
        item.innerHTML = ort.name;
        item.title = 'Zoom zu ' + ort.name;
        
        // Click Event
        L.DomEvent.on(item, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          
          map.setView([ort.lat, ort.lon], ort.zoom);
          
          // Kurzes Highlight
          item.style.backgroundColor = '#0066cc';
          item.style.color = 'white';
          setTimeout(function() {
            item.style.backgroundColor = '';
            item.style.color = '';
          }, 500);
          
          console.log('📍 Navigation zu: ' + ort.name + ' (Zoom ' + ort.zoom + ')');
        });
      });
      
      // Toggle Funktion für Header
      var isCollapsed = false;
      L.DomEvent.on(header, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        
        if (isCollapsed) {
          liste.style.display = 'block';
          header.querySelector('.ortschaften-toggle-icon').textContent = '▼';
          isCollapsed = false;
        } else {
          liste.style.display = 'none';
          header.querySelector('.ortschaften-toggle-icon').textContent = '▶';
          isCollapsed = true;
        }
      });
      
      // Verhindere Map-Events beim Interagieren mit Control
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      return container;
    }
  });
  
  new OrtschaftenControl().addTo(map);
  console.log('✅ Ortschaften-Control geladen (rechts, collapsible)');
}