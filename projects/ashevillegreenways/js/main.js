
// "global" variables use in other functions
var greenwayLines;
var map;

// function to create map, layers and bounds
function createMap(){
    
    // create map object
     map = L.map('map', { zoomControl:false, minZoom:11 }).setView([35.584654, -82.550308], 11);
    
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
    }).addTo(map);
    
    var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    imagery.setOpacity(0.5);
    
    // create map element layer restictions based on zoom for basemaps
    map.on('zoomend', function() {
        if (map.getZoom() <16){
            if (map.hasLayer(imagery)) {
                map.removeLayer(imagery);
                map.addLayer(grayscale)
            } else {
                //console.log("no point layer active");
            }
        }
        if (map.getZoom() >= 16){
            if (map.hasLayer(imagery)){
                //console.log("layer already added");
            } else {
                map.addLayer(imagery);
            }
        }
    }
   )
    
    // create bounds
    var northEast = L.latLng(35.852301, -83.063367),
    southWest = L.latLng(35.305013, -81.912549);
    var bounds = L.latLngBounds(southWest, northEast);
    
    // set bounds
    map.setMaxBounds(bounds);
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });
    
    //call function to get data
    getData(map);
}

// open side nav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("openSide").style.visibility = "hidden";
}
// close side nav
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("openSide").style.visibility = "visible";
}
// set side nav width - called on load
function setSideNavWidth(){
     if ($(window).width() < 1000) {
         document.getElementById("mySidenav").style.width = "0px";
         document.getElementById("openSide").style.visibility = "visible";
    }
    else {
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("openSide").style.visibility = "hidden";
    }
    
    $('#instructionsDiv').fadeIn('fast').delay(1000).fadeOut('fast');
}

// open github info page on title click
$("#titleContainer").click(function () {
    var northEast = L.latLng(35.852301, -83.063367),
    southWest = L.latLng(35.305013, -81.912549);
    var originalBounds = L.latLngBounds(southWest, northEast);
    map.fitBounds(originalBounds);
});

// filter through greenways list when typing in search box
function searchFilter() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("greenwayList");
    li = ul.getElementsByClassName("greenwayButton");

     //Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        //console.log(li[i].getAttribute("id"));
        a = li[i].getAttribute("id");
        if (a.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

// function to change the map and zoom when item from list clicked
function greenwayListClicked(e){
    var objectClickedID = e.classList[1];
    greenwayLines.eachLayer(function (layer){
        
        // reset layer symbols
        var status = layer.feature.properties.Status;
        if (status == "Proposed"){
              layer.setStyle({color: "#9370DB", weight: "3", opacity: ".95", dashArray: "5 7"});
          } else {
              layer.setStyle({color: "#4C704C", weight: "5"});
          }    
        
        var feature = layer.feature.properties.OBJECTID;
        if (feature == objectClickedID){
            
            //change the info window and select line segment and zoom to
            layer.openPopup();
            layer.setStyle({weight: 10});
            
            document.getElementById("infoDiv").innerHTML = '<div id="updateInfo"><h2>' + layer.feature.properties.SegmntName + '</h2><div id="infoSpan"><b>Length (mi): </b>' + layer.feature.properties.Length_ + '<br><br><b>Status: </b>' + layer.feature.properties.Status + '<br><br><b>Location:</b> ' + layer.feature.properties.Focus_area + '<br><br><b>Design Stage: </b>' + layer.feature.properties.DesgStatus + '</div></div>';
            
            map.fitBounds(layer.getBounds(), {padding: [250, 250]});
            
        }            
    }) 
    
}

//function to import GeoJSON data
function getData(map){
    
    var outlineStyle = {
        "color": "#a8a8a8",
        "weight": 5,
        "opacity": 0.65,
        "className": "mask"
    };
    //load the data from geojson as JS file (both the local file and ajax were used to load to show both methods of loading data)
    L.geoJSON(outline, {style: outlineStyle}).addTo(map);
    
    // load data from ajax and populate map and list
    $.ajax("data/greenwaysProjected.geojson", {
        dataType: "json",
        success: function(response){            
            var greenways = response;
            
            greenwayLines = L.geoJSON(greenways, {
                 style: function(feature) {
                    switch (feature.properties.Status) {
                        case 'Existing': return {color: "#4C704C", weight: "5"};
                        case 'Proposed':   return {color: "#9370DB", weight: "3", opacity: ".95", dashArray: "5 7"};
                    }
                },
                onEachFeature: createSideBar
            }).addTo(map); 
            
            map.almostOver.addLayer(greenwayLines);
            
            var circle = L.circleMarker([0, 0], {radius: 5, fillColor: 'white', fillOpacity: 1});
            
            map.on('almost:over', function (e) {
                map.addLayer(circle);
              });

              map.on('almost:move', function (e) {
                circle.setLatLng(e.latlng);
              });

              map.on('almost:out', function (e) {
                map.removeLayer(circle);
              });

              map.on('almost:click', function (e) {
                  
                e.layer.openPopup(); 
                e.layer.setStyle({weight: 10});
                
                document.getElementById("infoDiv").innerHTML = '<div id="updateInfo"><h2>' + e.layer.feature.properties.SegmntName + '</h2><div id="infoSpan"><b>Length (mi): </b>' + e.layer.feature.properties.Length_ + '<br><br><b>Status: </b>' + e.layer.feature.properties.Status + '<br><br><b>Location:</b> ' + e.layer.feature.properties.Focus_area + '<br><br><b>Design Stage: </b>' + e.layer.feature.properties.DesgStatus + '</div></div>';
                  
              });
            
            // reset the info window when popup is closed
            map.on('popupclose', function(e) {
                greenwayLines.eachLayer(function (layer){
                    var status = layer.feature.properties.Status;
                    if (status == "Proposed"){
                          layer.setStyle({color: "#9370DB", weight: "3", opacity: ".95", dashArray: "5 7"});
                      } else {
                          layer.setStyle({color: "#4C704C", weight: "5"});
                      }                       
                }) 

                document.getElementById("infoDiv").innerHTML = '<div id="startInfo"><h2>Instructions:</h2><p>This is a simple map tool to view greenway information in Asheville, NC and it\'s metro area.<br><br> Use the side bar to select a greenway to begin exploring! <a href="https://www.google.com" target="_blank">More info</a></p></div>'
                
            });
            
        }
    });
};

// this function generates the sidebar based on the data and syles accordingly 
function createSideBar(feature, layer){
    
    var greenwayName = feature.properties["GW_Name"];
    var greenwayImage = feature.properties["imagePath"];
    var greenwayStatus = feature.properties["Status"];
    var greenwayID = feature.properties["OBJECTID"];
    
    var container = document.getElementById("greenwayList");
    
    if (greenwayStatus == "Proposed"){
        $(container).append('<div class="greenwayButton ' + greenwayID + '" onclick="greenwayListClicked(this)" style="border-style:dashed; border-color:#9370DB;" id="' + greenwayName + '"><img class="buttonImage" src="img/photos/' + greenwayImage + '" alt="greenwayImage" height="180" width="180"><div class="buttonText">' + greenwayName + '</div></div>');
    } else {
        $(container).append('<div class="greenwayButton ' + greenwayID + '" onclick="greenwayListClicked(this)" id="' + greenwayName + '"><img class="buttonImage" src="img/photos/' + greenwayImage + '" alt="greenwayImage" height="180" width="180"><div class="buttonText">' + greenwayName + '</div></div>');
    }
    
    layer.bindPopup(feature.properties.GW_Name);
    
}

// function to initialize the page and map, called when the document is ready
$( document ).ready(function() {
    setSideNavWidth();
    createMap();
});