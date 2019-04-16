var map;


// function called to create main map, set center and basemap
function createMap(){

    // create map object
    map = L.map('map', { zoomControl:false, minZoom:1 }).setView([35.595395, -82.552486], 16);   

    //add basemap
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/basic-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        maxZoom: 22,
        id: 'mapbox.basic',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
    }).addTo(map);    
}

// function to initialize the page and map, called when the document is ready
$( document ).ready(function() { 
    createMap();
});