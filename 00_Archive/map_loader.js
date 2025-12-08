/**
 * Leaflet Map Loader - EMSR517 Geodaten
 * Lädt alle Geodaten aus dem Ordner 11.08.2021_EMSR517_json
 */

document.addEventListener('DOMContentLoaded', function () {
  
  // Kartenzentriert auf Schuld, Ahrtal
  const map = L.map('map').setView([50.450453753490834, 6.888650882405452], 13);

  // ============================================
  // VERSCHIEDENE KARTENANSICHTEN (BASE LAYERS)
  // ============================================
  
  const baseMaps = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }),
    
    "Humanitarian": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }),
    
    "Satellit (Esri)": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18
    }),
    
    "CartoDB": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
      maxZoom: 19
    })
  };

  // Standard-Karte beim Start
  baseMaps["OpenStreetMap"].addTo(map);

  // ============================================
  // ZENTRUM MARKER
  // ============================================
  const centerMarker = L.marker([50.450453753490834, 6.888650882405452], {
    title: 'Schuld - Zentrum der Betrachtung'
  }).addTo(map);
  
  centerMarker.bindPopup("<b>Schuld</b><br>Zentrum der Betrachtung");

  // ============================================
  // GEODATEN KONFIGURATION
  // ============================================
  
  const geoDataConfig = [
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_areaOfInterestA_r1_v3.json',
      name: 'Area of Interest',
      description: 'AOI - Untersuchungsgebiet',
      style: {
        color: '#7e0909',
        fillOpacity: 0.1,
        weight: 3,
        dashArray: '5, 5'
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_observedEventA_r1_v3.json',
      name: 'Observed Event',
      description: 'Beobachtete Ereignisse',
      style: {
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.4,
        weight: 2
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_builtUpP_r1_v3.json',
      name: 'Built Up',
      description: 'Bebaute Flächen',
      style: {
        color: '#8b7355',
        fillColor: '#a0826d',
        fillOpacity: 0.5,
        weight: 1
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_facilitiesA_r1_v3.json',
      name: 'Facilities',
      description: 'Einrichtungen',
      style: {
        color: '#f0ad4e',
        fillColor: '#f0ad4e',
        fillOpacity: 0.6,
        weight: 2
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_hydrographyA_r1_v3.json',
      name: 'Hydrography Area',
      description: 'Hydrographie - Flächen',
      style: {
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.4,
        weight: 2
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_hydrographyL_r1_v3.json',
      name: 'Hydrography Lines',
      description: 'Hydrographie - Linien',
      style: {
        color: '#2980b9',
        fillOpacity: 0,
        weight: 2
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_naturalLandUseA_r1_v3.json',
      name: 'Natural Land Use',
      description: 'Natürliche Landnutzung',
      style: {
        color: '#27ae60',
        fillColor: '#27ae60',
        fillOpacity: 0.05,
        weight: 1
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_transportationL_r1_v3.json',
      name: 'Transportation',
      description: 'Verkehrswege',
      style: {
        color: '#34495e',
        fillOpacity: 0,
        weight: 2
      }
    },
    {
      file: './11.08.2021_EMSR517_json/EMSR517_AOI15_GRA_MONIT01_imageFootprintA_r1_v3.json',
      name: 'Image Footprint',
      description: 'Satellitenbildbereich',
      style: {
        color: '#9b59b6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '3, 3'
      }
    }
  ];

  // ============================================
  // LAYER MANAGEMENT
  // ============================================
  
  let allLayers = [];
  const layerGroups = {};
  const overlayMaps = {};

  /**
   * Lädt eine GeoJSON Datei und fügt sie zur Karte hinzu
   */
  function loadGeoJSON(config) {
    fetch(config.file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`✓ ${config.name}: Erfolgreich geladen`, data);
        
        const features = data.features || [data];
        const layerGroup = L.featureGroup();
        
        features.forEach((feature, index) => {
          if (feature.geometry) {
            const geometry = createGeometry(feature, config);
            if (geometry) {
              layerGroup.addLayer(geometry);
              allLayers.push(geometry);
            }
          }
        });
        
        // Layer zur Karte hinzufügen
        layerGroup.addTo(map);
        layerGroups[config.name] = layerGroup;
        overlayMaps[config.name] = layerGroup;
        
        console.log(`  → ${features.length} Features hinzugefügt (${config.name})`);
      })
      .catch(error => {
        console.error(`✗ Fehler beim Laden von ${config.name}:`, error);
      });
  }

  /**
   * Erstellt Geometrie basierend auf Geometry-Typ
   */
  function createGeometry(feature, config) {
    const geometry = feature.geometry;
    const style = config.style;
    let geoLayer = null;

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      geoLayer = L.geoJSON(feature, {
        style: style,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(createPopupContent(feature, config));
        }
      });
    } 
    else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      geoLayer = L.geoJSON(feature, {
        style: style,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(createPopupContent(feature, config));
        }
      });
    } 
    else if (geometry.type === 'Point') {
      const damageGrade = feature.properties ? feature.properties.damage_gra : null;
      const pointColor = getDamageColor(damageGrade);
      
      geoLayer = L.geoJSON(feature, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            color: pointColor,
            fillColor: pointColor,
            fillOpacity: 0.7,
            weight: 2
          });
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(createPopupContent(feature, config, pointColor));
        }
      });
    }

    return geoLayer;
  }

  /**
   * Erstellt Popup-Content mit Properties
   */
  function createPopupContent(feature, config, pointColor = null) {
    let popupContent = `<b>${config.name}</b><br>`;
    popupContent += `<i>${config.description}</i><br><br>`;
    
    if (pointColor) {
      popupContent += `<b style="color: ${pointColor}">● Kategorie</b><br><br>`;
    }
    
    if (feature.properties) {
      popupContent += '<b>Attribute:</b><br>';
      for (let key in feature.properties) {
        const value = feature.properties[key];
        popupContent += `<strong>${formatKey(key)}:</strong> ${value}<br>`;
      }
    }
    
    return popupContent;
  }

  /**
   * Formatiert Property-Namen für Anzeige
   */
  function formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Bestimmt Farbe basierend auf Schadensgrad
   */
  function getDamageColor(damageGrade) {
    if (!damageGrade) return '#999999';
    
    switch(damageGrade.toLowerCase()) {
      case 'destroyed':
        return '#8B0000';
      case 'damaged':
        return '#DC143C';
      case 'possibly damaged':
      case 'possibly_damaged':
        return '#FFD700';
      default:
        return '#999999';
    }
  }

  /**
   * Passt Kartenausschnitt an alle Layer an
   */
  function updateMapView() {
    if (allLayers.length > 0) {
      const group = L.featureGroup(allLayers);
      map.fitBounds(group.getBounds().pad(0.05), { 
        maxZoom: 15,
        animate: true 
      });
      console.log(`✓ Kartenausschnitt angepasst für ${allLayers.length} Layer`);
    }
  }

  // ============================================
  // LAYER CONTROL
  // ============================================
  
  L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: false
  }).addTo(map);

  // ============================================
  // ALLE GEODATEN LADEN
  // ============================================
  
  console.log('🗺️  Starte Laden von Geodaten...');
  
  // Mit Verzögerung laden, damit die Karte initialisiert ist
  setTimeout(() => {
    geoDataConfig.forEach(config => {
      loadGeoJSON(config);
    });
    
    // Kartenausschnitt anpassen nach allen Loads (mit Verzögerung)
    setTimeout(updateMapView, 1500);
  }, 500);

  // ============================================
  // HILFSFUNKTIONEN
  // ============================================
  
  // Karte bei Fenstergrößenänderung neu zeichnen
  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  // Initial Size Update
  setTimeout(() => map.invalidateSize(), 100);

  // Logging
  console.log('🗺️  Karteninitialisierung abgeschlossen');
  console.log('📊 Verfügbare Layer:', Object.keys(overlayMaps));
});
