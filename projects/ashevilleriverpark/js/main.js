//set up local maps
var map;
var formMap;

// set up local graphic layers 
var locationGraphics = L.featureGroup();
var locationGraphicsForm = L.featureGroup();

//set up layer groups for each layer in map
var greenwayTrails = L.layerGroup();
var parkShadow = L.layerGroup();
var parkingLayer = L.layerGroup();
var amenitiesLayer = L.layerGroup();
var recreationLayer = L.layerGroup();
var picnicLayer = L.layerGroup();
var issueLayer = L.layerGroup();

// set up icons for map
var parkingIcon = L.icon({
    iconUrl: 'img/mapIconsSVG/parking.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});
var recreationIcon = L.icon({
    iconUrl: 'img/mapIconsSVG/recreation.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});
var picnicIcon = L.icon({
    iconUrl: 'img/mapIconsSVG/picnic.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});
var amenitiesIcon = L.icon({
    iconUrl: 'img/mapIconsSVG/amenities.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});
var issueIcon = L.icon({
    iconUrl: 'img/mapIconsSVG/issue.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});

// configure popups for map points
function onEachRecreationFeature(feature, layer) {
    if (feature.properties && feature.properties.type) {
        layer.bindPopup(feature.properties.type);
    }
}
function onEachPicnicFeature(feature, layer) {
    if (feature.properties && feature.properties.details) {
        layer.bindPopup(feature.properties.details);
    }
}
function onEachAmenitiesFeature(feature, layer) {
    if (feature.properties && feature.properties.type) {
        layer.bindPopup(feature.properties.type);
    }
}

// function called to create main map, add layers, set center and basemap
function createMap(){

    // create map object
    map = L.map('map', { zoomControl:false, minZoom:1, layers: [greenwayTrails, parkShadow, parkingLayer, amenitiesLayer, recreationLayer, picnicLayer] }).setView([35.568897, -82.572671], 16);  

    //add basemap
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/basic-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, grayscale   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 22,
        id: 'mapbox.basic',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
    }).addTo(map);
        
}

// function called to create second map on form page
function createFormMap(){
    
    // create map object
    formMap = L.map('formMap', { zoomControl:true, minZoom:1 }).setView([35.565961, -82.579649], 18);  

    //add basemap
    var sat = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 22,
        id: 'mapbox.basic',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ',
        opacity: .5
    }).addTo(formMap);
       
    //disable scrool wheel zoom
    formMap.scrollWheelZoom.disable();
    
}

//load JSON data to use in map 
function loadStartingJSON(){
    
    //load greenway data
    $.getJSON("data/greenway_layer.json", function (data) {

        var myStyle = {
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
        };
        
        L.geoJSON(data, {
            style: function(feature) {
                switch (feature.properties.segmenttyp) {
                    case 'PROPOSED GREENWAY': return {color: "#ff7800", dashArray: '5, 10', opacity: .7};
                    case 'GREENWAY':   return {color: "#556B2F", opacity: .7};
                }
            },
            interactive: false
        }).addTo(greenwayTrails);
        
    });
    
    //load park focus layer
    $.getJSON("data/eraseCounty.json", function (data) {
        
        L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: '#808080', 
                    weight: 0.3, 
                    fillOpacity: .3, 
                    opacity: 1
                };
            },
            interactive: false
        }).addTo(parkShadow);
        
    });
    
    //load parking layer and set icon
    $.getJSON('data/parkingLots.json', function (data) {
        L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: parkingIcon});
            }
        }).addTo(parkingLayer); 
    }); 
    
    // load recreation layer and set icon
    $.getJSON('data/recreation.json', function (data) {
        L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: recreationIcon});
            },
            onEachFeature: onEachRecreationFeature
        }).addTo(recreationLayer); 
    });
    
    // load picnic area layer
    $.getJSON('data/picnicAreas.json', function (data) {
        L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: picnicIcon});
            },
            onEachFeature: onEachPicnicFeature
        }).addTo(picnicLayer); 
    }); 
 
    //load amenities layer
    $.getJSON('data/amenities.json', function (data) {
        L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: amenitiesIcon});
            },
            onEachFeature: onEachAmenitiesFeature
        }).addTo(amenitiesLayer); 
    }); 
    
    // query for our data table
    var query = "SELECT * FROM geog777_project2";

    //load issue layer from cartoDB
   $.getJSON("https://andrickba.carto.com/api/v2/sql?format=GeoJSON&q="+query, function(data) {
        L.geoJson(data,{
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: issueIcon});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.date + '</b><br /><em>' + feature.properties.details + '</em></p>');
            }
        }).addTo(issueLayer);
    });
}

// functions to handle button click for GPS
$( "#getLocationButton" ).click(function() {     

    getLocation();

});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
      alert("Geolocation is not supported by this browser.");
  }
}

//show the position on the map
function showPosition(position) {

    //set map center
    map.setView([position.coords.latitude, position.coords.longitude], 19);
    
    //build circle graphics
    L.circle([position.coords.latitude, position.coords.longitude],{radius: 20, color:'white',weight:.5, opacity:.6,fillColor: '#4077A5',fillOpacity:.5}).addTo(locationGraphics);
    
    L.circle([position.coords.latitude, position.coords.longitude],{radius: 3, color:'white',weight:.5, opacity:1,fillColor: '#4077A5',fillOpacity:1}).addTo(locationGraphics);
    
    //add graphics to map
    map.addLayer(locationGraphics);
    
    //remove positon after 3 seconds
    setTimeout(function() { locationGraphics.clearLayers(); }, 3000);
    
}

// function to handle button for gps click on form

$( "#getLocationButton2" ).click(function() {     

    getLocationForm();

});

function getLocationForm() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPositionForm);
  } else { 
      alert("Geolocation is not supported by this browser.");
  }
}

function showPositionForm(position) {
    
    //set center on form map
    formMap.setView([position.coords.latitude, position.coords.longitude], 20);
        
}

//function to handle home button click
$( "#goHomeButton" ).click(function() {     
    
    map.setView([35.568897, -82.572671], 16);

});

//function to handle home button click
$( "#openLayersButton" ).click(function() {     
    
    $("#layerListHolder").fadeIn(400);
    $("#openLayersButton").fadeOut(200);

});

//function to handle home button click
$( "#closeLayersButton" ).click(function() {     
    
    $("#layerListHolder").fadeOut(400);
    $("#openLayersButton").fadeIn(500);

});

//function to handle legend button click
$( "#openLegendButton" ).click(function() {     
    
    document.getElementById("legendHolder").style.height="370px";
    document.getElementById("openLegendButton").style.display="none";
    document.getElementById("closeLegendButton").style.display="flex";
    

});

//function to handle legend button click
$( "#closeLegendButton" ).click(function() {     
    
    document.getElementById("legendHolder").style.height="50px";
    document.getElementById("openLegendButton").style.display="flex";
    document.getElementById("closeLegendButton").style.display="none";
    
});

//function to handle submit data to cartoDB button click
$( "#sumbitForm" ).click(function() {     

    var value1 = document.getElementById("nameValue").value.toString();
    var value2 = document.getElementById("dateValue").value.toString();
    var value3 = document.getElementById("issueValue").value.toString();
    var value4 = document.getElementById("phoneValue").value.toString();
    var value5 = document.getElementById("emailValue").value.toString();
    
    var valueCenter = formMap.getCenter();
    var value6 = valueCenter.lng;
    var value7 = valueCenter.lat;

    var cartoURL = "https://andrickba.carto.com/api/v2/sql?q=INSERT INTO geog777_project2 (name, date, details, phone, email, the_geom) VALUES ('" + value1 + "', '" + value2 + "', '" + value3 + "', '" + value4 + "', '" + value5 + "', ST_SetSRID(ST_Point(" + value6 + ", " + value7 + "),4326))&api_key=sFeVHC0wpmGdTd-IlwCoAQ";

    if (value2 == "" || value3 == "" || value6 == "" || value7 == ""){
        
        var x = document.getElementById("snackbar2");
        x.className = "snackbar show";
        
        setTimeout(function(){ x.className = x.className.replace("snackbar show", "snackbar"); }, 3000);
      
    }else{
      
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", cartoURL, true);
        xmlhttp.send();
        
        console.log("submit successful");
        
        $("#reportDiv").animate({ scrollTop: 0 }, "fast");
        $("#nameValue").val('');
        $("#dateValue").val('');
        $("#issueValue").val('');
        $("#phoneValue").val('');
        $("#emailValue").val('');
        
        formMap.setView([35.565961, -82.579649], 18);
        
        var x = document.getElementById("snackbar1");
        x.className = "snackbar show";
        setTimeout(function(){ x.className = x.className.replace("snackbar show", "snackbar"); }, 3000);
        
        issueLayer.clearLayers();
        
        // set timeout to wait 9 seconds and refresh the issues layer
        setTimeout(function() { 
            
            locationGraphics.clearLayers(); 
            
            var query = "SELECT * FROM geog777_project2";
        
            $.getJSON("https://andrickba.carto.com/api/v2/sql?format=GeoJSON&q="+query, function(data) {
                L.geoJson(data,{
                    pointToLayer: function (feature, latlng) {
                        return L.marker(latlng, {icon: issueIcon});
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup('<p><b>' + feature.properties.date + '</b><br /><em>' + feature.properties.details + '</em></p>');
                        //layer.cartodb_id=feature.properties.cartodb_id;
                    }
                }).addTo(issueLayer);
            });
        }, 9000);
    }

});

// function to handle tab click events
function openPage(pageName,elmnt,color) {
    
    var i, tabcontent, tablinks;
    
    tabcontent = document.getElementsByClassName("tabcontent");
    
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    tablinks = document.getElementsByClassName("tablink");
    
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    
    document.getElementById(pageName).style.display = "block";
    
    elmnt.style.backgroundColor = color;
    
}

// Get the element with id="defaultOpen" and click on it to set up page
document.getElementById("defaultOpen").click();


// call function on tab click to refresh maps in case of page resize issues
$( ".tablink" ).click(function() {     

    formMap.invalidateSize();
    map.invalidateSize();
});

// function to style the phone input info of the form
function phoneMask() { 
    var num = $(this).val().replace(/\D/g,''); 
    $(this).val('(' + num.substring(0,3) + ') ' + num.substring(3,6) + '-' + num.substring(6,10)); 
}
$('[type="tel"]').keyup(phoneMask);

// handle layer toggle changes
$('#LayerList input[type="checkbox"]').on('change', function() {    
    var checkBox = $(this);
    var layer = checkBox.data().layer; 

    if (layer == "ParkShadowBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(parkShadow);
          } else {
            map.removeLayer(parkShadow);
          }        
    }else if(layer == "GreenwayBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(greenwayTrails);
          } else {
            map.removeLayer(greenwayTrails);
          } 
    }else if(layer == "ParkingLotBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(parkingLayer);
          } else {
            map.removeLayer(parkingLayer);
          } 
    }else if(layer == "PicnicAreaBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(picnicLayer);
          } else {
            map.removeLayer(picnicLayer);
          } 
    }else if(layer == "AmenitiesBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(amenitiesLayer);
          } else {
            map.removeLayer(amenitiesLayer);
          } 
    }else if(layer == "RecInfoBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(recreationLayer);
          } else {
            map.removeLayer(recreationLayer);
          } 
    }else if(layer == "ReportedBox"){
        if ($(checkBox).is(':checked')){
            map.addLayer(issueLayer);
          } else {
            map.removeLayer(issueLayer);
          } 
    }else{
        console.log("otherCLicked");
    }
    
});

// handle input when user toggles the contacted radios
$('#radioButtons input[type="radio"]').on('change', function() {    
    var radioBox = $(this);
    var layer = radioBox.data().layer; 

    if (layer == "yesRadioBox"){   
        $("#contactDiv").fadeIn(300);
    }else {
        $("#contactDiv").fadeOut(300);
        $(".inputRadio").val('');   
    }
    
});

// function to initialize the page and map, called when the document is ready
$( document ).ready(function() { 
    createMap();    
    loadStartingJSON();
    createFormMap();
});
