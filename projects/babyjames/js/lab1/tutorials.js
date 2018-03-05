
////////////////////////////////////////////////
////// Example from Leaflet Quick Start Guide below:
////////////////////////////////////////////////

//Create a new instance of a map and set the starting location and zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

//Create a tile layer from mapbox and add it to the map 
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
}).addTo(map);

// create a new marker at the given coordinates and add it to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

// create a new circle graphic, set the coordinate, size, and properties and add it to the map
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

// create a new polygon from the given coordinate array and add it to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// create popup with the text given and bind it to the marker, also open it
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// create popup with the text given and bind it to the circle graphic
circle.bindPopup("I am a circle.");
// create popup with the text given and bind it to the polygon
polygon.bindPopup("I am a polygon.");

// generate a new standalone popup, set it coordiantes, content and open it
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

// create a new popup without any parameters
var popup = L.popup();

// function that will be set to fire when someone clicks on the map, the popup that was previously created is then flled with the latlng information and opened
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// the on click function of the map is set to fire the onMapClick function set above
map.on('click', onMapClick);




////////////////////////////////////////////////
////// Example from Using GeoJSON with Leaflet below:
////////////////////////////////////////////////

//Create a new instance of a map and set the starting location and zoom level
var map = L.map('map').setView([39.74739, -105], 13);


//Create a tile layer from mapbox and add it to the map 
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
}).addTo(map);


// a new json array is created with two lineStrings in it
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// a variable to hold the syle parameters is set up
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// the json array of linestrings that was created eariler is passed into the geoJSON method in leaflet and given the syle parameters that were set up, then the geoJSON is added to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);


// a new json array that contains the information for state polygons is set up  
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// the states json array is passed into the geoJSON method and the syle is set based on the party property of the json feature, then the geoJSON is added to the map
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);


// marker properties are set up as a variable 
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// function is set up to bind a popup if there is any popupcontent set
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// a new json feature is set up for a single point
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// a the point json is passed to the geoJSON mehtod in leaflet to create the point feature, the latlng and marker options properties are set and the one each feature bindpopup is set for each feature, then the geojson is added to the map
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature
}).addTo(map);
