let jQuery = window.jQuery

const resourcesDatabases = resourcesDatabase
let userPosition
let resourcesFilter = {}

mapboxgl.accessToken = 'pk.eyJ1Ijoic3BlY2lhbGVkdWNhdGlvbnJlc291cmNlcyIsImEiOiJjazdmMm1sZzIwMHlvM2tteWRiOHU2MWxwIn0.V78FUxvqimka5uPOuJR8Cg';

var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //color of the map -- dark-v10 or light-v9
  center: [-74.0060, 40.7128], // starting position - Princeton, NJ :)
  zoom: 12, // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});
map.addControl(geocoder, "top-right");

// Add geolocate control to the map. -- this zooms in on the user's current location when pressed
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
);

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

map.on('load', function() {
  // add a source for the resources
  map.addSource('resources', {
    type: 'geojson',
    data: GeoJSON.parse(resourcesDatabase, {Point: ['Latitude', 'Longitude']})
  });
  map.addLayer({
    'id': 'allResources',
    'type': 'circle',
    'source': 'resources',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
      'circle-radius': 8,
      'circle-color': 'rgba(55,148,179,1)'
    }
  });
});
