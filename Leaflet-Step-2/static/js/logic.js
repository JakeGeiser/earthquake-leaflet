// Store earthquate API endpoint inside quakeURL
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(quakeURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createQuakeMap(data.features);
  });

function createQuakeMap(earthquakeData) { // takes list of quakes in geoJSON dictionary format

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachQuake(feature, layer) {
        layer.bindPopup("<h3>Magnitude: " +feature.properties.mag + "<br>Depth: " +feature.geometry.coordinates[2]
        +"km</h3><hr><p>"+ feature.properties.place +"</p>"
        +"<p>" + new Date(feature.properties.time) + "</p>");
    }
    // Define function to change style of map markers
    function markerOpt(feature) {
        // set marker style
        var geojsonMarkerOptions = {
          radius: 4* feature.properties.mag,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return geojsonMarkerOptions;
    }
    // find color based of depth in km
    function getColor(d) {
        return d >= 500 ? '#800026' :
               d >= 200  ? '#BD0026' :
               d >= 100  ? '#E31A1C' :
               d >= 50  ? '#FC4E2A' :
               d >= 20   ? '#FD8D3C' :
               d >= 0   ? '#FEB24C' :
                          '#FFEDA0';
    }


    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachQuake,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerOpt(feature));
          }
    });

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var outmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street": streetmap,
        "Outdoors": outmap,
        "Satellite": satmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
        37.09, -95.71
        ],
        zoom: 3,
        layers: [satmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to map
    // code from https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 20, 50, 100, 200, 500],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + 'km<br>' : '+');
        }

        return div;
    };

legend.addTo(myMap);
}
