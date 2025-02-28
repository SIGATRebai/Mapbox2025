///// Configuration de la carte /////
////////// Base //////////
var map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Fond de carte
  center: [-1.678, 48.113], // lat/long
  zoom: 12, // zoom
  pitch: 20, // Inclinaison
  bearing: 0 // Rotation
});

////////// Gestion du changement de style //////////
document.getElementById('style-selector').addEventListener('change', function () {
  const newStyle = this.value;
  map.setStyle(newStyle);

  map.once('style.load', function () {
    addLayers(); // Ajoute les couches après le chargement du style
  });
});

////////// Boutons de navigation //////////
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'bottom-right');

////////// Ajout Echelle cartographique //////////
map.addControl(new maplibregl.ScaleControl({
  maxWidth: 120,
  unit: 'metric'
}));

////////// Bouton de géolocalisation //////////
map.addControl(new maplibregl.GeolocateControl
  ({positionOptions: {enableHighAccuracy: true},
  trackUserLocation: true,
  showUserHeading: true
}));

///// Création d'un marqueur /////
////////// Ajout Marqueur //////////
const marker1 = new maplibregl.Marker()
  .setLngLat([-1.679, 48.083])
  .addTo(map);

////////// Contenu de la popup du marqueur //////////
var popup = new maplibregl.Popup({ offset: 25 })
  .setHTML('<h3>Alma</h3><p>Centre commerciale avec une animalerie à coté !</p> <br> <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5c/8c/aa/caption.jpg?w=1000&h=-1&s=1" width=100% >');
var customOptions = {'maxWidth': '300', 'className' : 'custom'}

////////// Associer Contenu et Marqueur //////////
marker1.setPopup(popup)

///// Ajout des couches /////
////////// Fonction pour ajouter les couches //////////
function addLayers() {
  ///// Arret de bus /////
  $.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["highway"="bus_stop"](area.searchArea););out center;`,
  function(data) {var geojsonbus = {
  type: 'FeatureCollection',
  features: data.elements.map(function(element) {
  return {type: 'Feature',
  geometry: { type: 'Point',coordinates: [element.lon, element.lat] },
  properties: {}};
  })
  };
  map.addSource('customData3', {
  type: 'geojson',
  data: geojsonbus
  });
  map.addLayer({
  'id': 'Arrets',
  'type': 'circle',
  'source': 'customData3',
   "layout": {'visibility': 'none'},
  'paint': {'circle-color': 'red',
  'circle-radius': 2},
  });
  });
  
///// Equipements publics /////
    map.addSource('Equipements', {
          type: 'vector',
          url: 'mapbox://ninanoun.4xcn5ude'});
    map.addLayer({
          'id': 'Equipements',
          'type': 'circle',
          'source': 'Equipements',
          'source-layer': 'base-orga-var-6k0zky',
          'layout': {'visibility': 'none'},
          'paint': {'circle-radius': {'base': 1.5,'stops': [[13, 2], [22, 60]]}, 'circle-color': '#16f337'}
    });

///// Bar (via OSM API) /////
    const ville = "Rennes";
    $.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["amenity"="bar"](area.searchArea););out center;`,
      function(data) {var geojsonData = {
        type: 'FeatureCollection',
        features: data.elements.map(function(element) {
          return {type: 'Feature',
          geometry: { type: 'Point',coordinates: [element.lon, element.lat] },
          properties: {}};
        })
      };
      map.addSource('customData', {
        type: 'geojson',
        data: geojsonData
      });
      map.addLayer({
        'id': 'pubs',
        'type': 'circle',
        'source': 'customData',
        'paint': {'circle-color': 'green',
        'circle-radius': 5},
        'layout': {'visibility': 'none'}
      });
    });  
  
///// BATIMENTS VIA BDTOPO /////
    map.addSource('BDTOPO', {
          type: 'vector',
          url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
          minzoom: 15,
          maxzoom: 19
    });
    map.addLayer({
        'id': 'batiments',
        'type': 'fill-extrusion',
        'source': 'BDTOPO',
        'source-layer': 'batiment',
        'layout': {'visibility': 'none'},
        'paint': {
          'fill-extrusion-color': {
            'property': 'hauteur',
            'stops': [[1, '#1a9850'],
              [10, '#eae2b7'],
              [20, '#fcbf49'],
              [30, '#f77f00'],
              [50, '#d62828'],
              [80, '#540b0e'],
              [100, '#003049']]},
          'fill-extrusion-height':{
            'type': 'identity',
            'property': 'hauteur'},
          'fill-extrusion-opacity': 0.70,
          'fill-extrusion-base': 0}
    });
  
  ///// BUS (temps réel via API) /////
    $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-bus-vehicules-position-tr/records?limit=100',
      function(data) {var geojsonbus = {
        type: 'FeatureCollection',
        features: data.results.map(function(element) {
        return {type: 'Feature',
        geometry: {type: 'Point',
        coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
        properties: {
          id: element.idbus,
          numbus: element.numerobus}};
        })
      };
      map.addLayer({ 'id': 'bus',
        'type':'circle',
        'source': {'type': 'geojson',
        'data': geojsonbus},
        'layout': {'visibility': 'none'},
        'paint': {'circle-color': 'red'}
      });
    }); 
  
///// CADASTRE (via ETALAB par flux tuiles vecteurs) /////
    map.addSource('Cadastre', {
          type: 'vector',
          url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' 
    });
    map.addLayer({
          'id': 'Cadastre',
          'type': 'line',
          'source': 'Cadastre',
          'source-layer': 'parcelles',
          'filter': [">", "contenance", 1000],
          'layout': {'visibility': 'none'},
          'paint': {'line-color': '#000000'},
          'minzoom':16, 'maxzoom':19 
    });
    map.setPaintProperty('communeslimites', 'line-width', ["interpolate",["exponential",1],["zoom"],16,0.3,18,1]);

///// Contour commune (via API) /////
    dataCadastre = 'https://apicarto.ign.fr/api/cadastre/commune?code_insee=35238';
        jQuery.when( jQuery.getJSON(dataCadastre)).done(function(json) {
            for (i = 0; i < json.features.length; i++) {
            json.features[i].geometry = json.features[i].geometry; // fait charger puis manger la géométrie
            };
        map.addLayer(
            {'id': 'Contourcommune',
            'type':'line',
            'source': {
                'type': 'geojson',
                'data': json},
            'paint' : {
                'line-color': 'black',
                'line-width':2.5},
            'layout': {'visibility': 'none'},
        });
    });

///// Hydrographie /////
    map.addLayer({
          'id': "Hydro",
          "type": "fill",
          "source": "mapbox-streets-v8",
          "layout": {'visibility': 'visible'},
          "source-layer": "water",
          "paint": {
            "fill-color": "#a9e0f0", 
            "fill-opacity": 0.5}
    });
 
  ///// Métro (via overpass, grâce à chaton) /////
    $.getJSON(`https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A100%5D%3B%0Away%5B%22railway%22%3D%22subway%22%5D%2848.08427182703979%2C-1.7120728512041938%2C48.130637405086034%2C-1.6007504482500927%29%3B%0Aout%20geom%3B%0A%0A%0A%0A`,
    function(data) {
      var geojsonmetro = {
        type: 'FeatureCollection',
        features: data.elements
          .filter(e => e.type === "way" && e.nodes) // Filtrer pour ne garder que les "ways"
          .map(function(element) {
            return {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: element.geometry.map(coord => [coord.lon, coord.lat]) // Construire la ligne
              },
              properties: {}
            };
          })
      };
      map.addSource('customData', {
        type: 'geojson',
        data: geojsonmetro
      });
      map.addLayer({
        'id': 'metro',
        'type': 'line',
        'source': 'customData',
        'paint': { 'line-color': 'purple', 'line-width': 5 }, // Augmenter l'épaisseur pour bien voir
        'layout': { 'visibility': 'none' }
      });
    });

///// Parkings relais par API /////
//ici on créer le json sur les champs que l'on veut garder = allege fichier 
    $.getJSON('https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
    function(data) {var geojsonData4 = {
      type: 'FeatureCollection',
      features: data.results.map(function(element) {
        return {type: 'Feature',
          geometry: {type: 'Point',
          coordinates: [
            element.coordonnees.lon, 
            element.coordonnees.lat]},
          properties: { 
            name: element.nom,
            capacity: element.jrdinfosoliste}};
      })
    };
    map.addLayer({ 
      'id': 'Parcrelais',
      'type':'circle',
      'layout': {'visibility': 'none'},
      'source': {
        'type': 'geojson',
        'data': geojsonData4},
      'paint': {
        'circle-color': '#D49A66',
        'circle-radius': {
          property: 'capacity',
          type: 'exponential',
          stops: [[10, 1],[500, 50]]},
        'circle-opacity': 0.8}
      });
    });

  ///// PLU par API /////
  dataPLU = 'https://apicarto.ign.fr/api/gpu/zone-urba?partition=DU_243500139';
        jQuery.when(jQuery.getJSON(dataPLU)).done(function(json) {
          // Filtrer les entités pour ne garder que celles avec typezone = 'U'
          var filteredFeatures = json.features.filter(function(feature)
              {return feature.properties.typezone === 'N';});
          // Créer un objet GeoJSON avec les entités filtrées
          var filteredGeoJSON = { type: 'FeatureCollection', features: filteredFeatures};
          map.addLayer({
              'id': 'PLU',
              'type': 'fill',
              'source': {'type': 'geojson',
              'data': filteredGeoJSON},
              'paint': {'fill-color': 'lightgreen',
              'fill-opacity': 0.0},
        });
    });
  
  ////////// Routes //////////
  map.addSource('mapbox-streets-v8', {
          type: 'vector',
          url: 'https://openmaptiles.geo.data.gouv.fr/data/france-vector.json'
  });
  map.addLayer({
          "id": "Routes",
          "type": "line",
          "source": "mapbox-streets-v8",
          "filter": ["all", ["in", "class", "motorway", "trunk", "primary"]],
          "layout": {'visibility': 'visible'},
          "source-layer": "transportation",
          "paint": {"line-color": "#f7b792", "line-width": 2, "line-opacity": 1},
          "maxzoom": 16
  });

///// Stations vélo Stars via API /////
    $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=60',
      function(data) {var geojsonvls = {
        type: 'FeatureCollection',
        features: data.results.map(function(element) {
        return {type: 'Feature',
        geometry: {type: 'Point',
        coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
        properties: {
          name: element.nom,
          nbplaces: element.nombreemplacementsdisponibles,
          nbvelos: element.nombrevelosdisponibles}};
        })
      };
      map.addLayer({ 'id': 'vls',
        'type':'circle',
        'source': {'type': 'geojson',
        'data': geojsonvls},
        'layout': {'visibility': 'none'},
        'paint':{
          'circle-color': 'lightblue',
          'circle-radius': {
              property: 'nbvelos',
              type: 'exponential',
              stops: [[10, 1],[200, 100]]},
          'circle-opacity': 0.8,
          'circle-stroke-color': 'blue',
          'circle-stroke-width': 0.3}
      });
    });
 
  ///// Pour le menu affichant les couches /////
  switchlayer = function (lname) {
            if (document.getElementById(lname + "CB").checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }
  
} // ferme tout les appel de couche

////////// Mise en ordre des fonds de cartes (marche qu'à moitier) //////////
///// Ajout des couches au chargement initial /////
map.on('load', addLayers);

///// Gestion du changement de style /////
document.getElementById('style-selector').addEventListener('change', function () {
  map.setStyle(this.value);
  map.once('style.load', addLayers); // Recharge les couches après changement de style
});

//////////////////// Interactivité Pop-up ////////////////////
////////// Pop-up click : arrêts de bus /////////////
 map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
  if (!features.length) {
  return;
  }
  var feature = features[0];
  var popup = new maplibregl.Popup({ offset: [0, -15] })
    .setLngLat(feature.geometry.coordinates)
    .setHTML('<h2>' + feature.properties.nom + '</h2><hr><h3>'
    +"Mobilier : " + feature.properties.mobilier + '</h3><p>')
    .addTo(map);
});
map.on('mousemove', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});

///// Pop-up click : stations vélos /////
map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['vls'] });
  if (!features.length) {
  return;
  }
  var feature = features[0];
  var popup = new maplibregl.Popup({ offset: [0, -15] })
    .setLngLat(feature.geometry.coordinates)
    .setHTML('<h2>' + feature.properties.name + '</h2><hr><h3>'
    + feature.properties.nbvelos + ' vélos disponibles</h3><p>'
    + feature.properties.nbplaces + ' places disponibles</h3><p>')
    .addTo(map);
});
map.on('mousemove', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['vls'] });
  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});

////////// Pop-up survol : parcs relais //////////
///// Interactivité HOVER /////
var popup = new maplibregl.Popup({
  className: "MypopupPR",
  closeButton: false,
  closeOnClick: false 
});
map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Parcrelais'] 
});

///// Change the cursor style as a UI indicator /////
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  if (!features.length) {
    popup.remove();
    return; 
  }
  var feature = features[0];
    popup.setLngLat(feature.geometry.coordinates)
    .setHTML('<h2>' + feature.properties.name + '</h2><hr><h3>' 
             + feature.properties.capacity + ' places disponibles </h3>')
    .addTo(map);
});


///// Configuration onglets geographiques /////
// Onglets Gare
document.getElementById('Gare').addEventListener('click', function ()
{ map.flyTo({
  zoom: 16,
  center: [-1.6713151004883504, 48.1038324805655],
  pitch: 70});
});
// Onglets Univ rennes1
document.getElementById('Rennes1').addEventListener('click', function ()
{ map.flyTo({
  zoom: 16,
  center: [-1.6731270629533062, 48.115850517921615],
  pitch: 70});
});
// Onglets Univ rennes2
document.getElementById('Rennes2').addEventListener('click', function ()
{ map.flyTo({
  zoom: 16,
  center: [-1.7015, 48.1193],
  pitch: 70});
});