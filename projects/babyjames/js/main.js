//function to instantiate the Leaflet map
function createMap(){
    // set up mapbox gray basemap
     var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
    });
    // set up color open street map base layer
    var color = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    
    //create the map
    var map = L.map('map', {
        center: [37.5, -94.2],
        zoom: 5,
        layers: [grayscale]
    });
    // create layergroup for basemaps
    var baseLayers = {
		"Grayscale": grayscale,
		"Color": color
	};
    // add the basemap controller with the respective basemap layers
    L.control.layers(baseLayers).addTo(map);
    
    //call getData function
    getData(map);
};

//function to calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = (100 / attValue) * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

 //function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
     var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#89cff0",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    var year = attribute.split("_")[1];
    
    //add formatted attribute to popup content string
    var popupContent = "<p><b>" + feature.properties.State + ", " + year + "</b></p><p>James Ranking: # " + feature.properties[attribute];

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });
    
     //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
        }
    });
    
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//function to add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//build an attributes array from james baby the data
function processJRankData(data){
    //empty array to hold attributes
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("jRank") > -1){
            attributes.push(attribute);
        };
    };
    
    return attributes;
};

//function to create map legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            var attribute = attributes[0];
            var year = attribute.split("_")[1];
            // disable clicks below div    
            L.DomEvent.disableClickPropagation(container);
                    
            $(container).append('<div id="LegendTitle">Popularity Ranking</div>');
            
            //legend svg string
            var svg = '<svg id="attribute-legend" width="170px" height="85px">';
                    
            //object to base loop on
            var circles = {
                max: 20,
                mean: 47.5,
                min: 75
            };

        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#89cff0" fill-opacity="0.5" stroke="#000000" cx="50"/>';

            //text string
            svg += '<text id="' + circle + '-text" x="105" y="' + circles[circle] + '"></text>';
        };
        //close svg string
        svg += "</svg>";     
            
        $(container).append(svg);

        $(container).append('<div id="Legend">' + year + '</div>');

        return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

//function to calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;
    //remove decimal from mean
    mean = Math.trunc(mean);
    //return values as an object
    return {
        max: min,
        mean: mean,
        min: max
    };
};

//function to update the legend
function updateLegend(map, attributes){
    //get year value
    var year = attributes.split("_")[1];
    //set text for legend
    $("#Legend").text(year);
    //get circle values
    var circleValues = getCircleValues(map, attributes);
    //add legend text for each circle value
    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 82 - radius,
            r: radius
        });

        //add legend text
        $('#'+key+'-text').text("# " + Math.round(circleValues[key]*100)/100);
    };

};

//function to create the squence controls
function createSequenceControls(map, attributes){
     //sequence control extends leaflet control
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            
            // end event listner to stop div click through
            L.DomEvent.disableClickPropagation(container);
            
            return container;
        }
    });

    map.addControl(new SequenceControl());
    
    //create range input element (slider)
     $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    //set forward and reverse button images
    $('#reverse').html('<img src="img/arrow_left24g.png">');
    $('#forward').html('<img src="img/arrow_right24g.png">');
    
    //set up skip function
    $('.skip').click(function(){
        var index = $('.range-slider').val();

        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
        changeTopStates(map,attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        var index = $(this).val();
        updatePropSymbols(map,attributes[index]);
        updateLegend(map, attributes[index]);
        changeTopStates(map,attributes[index]);
    });
    
};

//function to resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
              //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //get current year
            var year = attribute.split("_")[1];
            //set new popup content
            var popupContent = "<p><b>" + props.State + ", " + year + "</b></p><p>James Ranking: # " + props[attribute];

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            
        };
    });
};
//function to create a state specific data viewer and picker
function createStateView(map,attributes){
        //create new state viewer by extendign leaflet control
        var StateViewer = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'ViewStateInfo');

            //create range input element (slider)
            $(container).append('<div id="topFiveTitle">Most Popular Names by State:</div>');
            $(container).append('<select name="state" id="stateSelect" ></select>');
            
            $(container).append('<ol id="stateList"><li id="top1"></li><li id="top2"></li><li id="top3"></li><li id="top4"></li><li id="top5"></li></ol>');
            
            $(container).append('<div id="jRankDiv"><div id="jRankTitle">James Rank:</div><div id="jRankData"></div></div>');

            // stop div from clicking through to map
            L.DomEvent.disableClickPropagation(container);
            

            return container;
        }
    });
    //add control to map
    map.addControl(new StateViewer());
    //get index and attribute
    var index = $('.range-slider').val();
    var attribute = attributes[index];
    // for each layer, add options to the picker and update current values
     map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
              //access feature properties
            var props = layer.feature.properties;
            
            var year = attribute.split("_")[1];
            
            var states = props.State;
            //add options for each state to dropdown
            var x = document.getElementById("stateSelect");
            var option = document.createElement("option");
            option.text = props.State;
            x.add(option);
            //get selected state value
            var e = document.getElementById("stateSelect");
            var selectedStateValue = e.options[e.selectedIndex].value;
            // set teh values of the rank box based on the current state selected
           if (layer.feature.properties.State == selectedStateValue) {
            var String1 = "Rank1_" + year;
            var String2 = "Rank2_" + year;
            var String3 = "Rank3_" + year;
            var String4 = "Rank4_" + year;
            var String5 = "Rank5_" + year;
            $("#top1").text(layer.feature.properties[String1]);
            $("#top2").text(layer.feature.properties[String2]);
            $("#top3").text(layer.feature.properties[String3]);
            $("#top4").text(layer.feature.properties[String4]);
            $("#top5").text(layer.feature.properties[String5]);
            $("#jRankData").text("# " + layer.feature.properties[attribute]);
               
           }
        };   
    });
    // handle the change event when the state in the dropdown selector changes
    $("#stateSelect").change(function() {
        //get index and fire function to update top 5 names
         var index = $('.range-slider').val();
        changeTopStates(map,attributes[index]);
    });  
};
//function to update the top 5 baby names based on state selected
function changeTopStates(map,attribute){

    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // get current year
            var year = attribute.split("_")[1];
            //get current state selected
            var e = document.getElementById("stateSelect");
            var selectedStateValue = e.options[e.selectedIndex].value;
            // set the top 5 values for the current state
           if (layer.feature.properties.State == selectedStateValue) {
            //var holder1 = layer.feature.properties.State;
            var String1 = "Rank1_" + year;
            var String2 = "Rank2_" + year;
            var String3 = "Rank3_" + year;
            var String4 = "Rank4_" + year;
            var String5 = "Rank5_" + year;
            $("#top1").text(layer.feature.properties[String1]);
            $("#top2").text(layer.feature.properties[String2]);
            $("#top3").text(layer.feature.properties[String3]);
            $("#top4").text(layer.feature.properties[String4]);
            $("#top5").text(layer.feature.properties[String5]);
            $("#jRankData").text("# " + layer.feature.properties[attribute]);
               
            }
        };       
    }); 
};

//function to import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/JamesName.geojson", {
        dataType: "json",
        success: function(response){
            // create attribute array
            var attributes = processJRankData(response);
            // fire functions to build map and data
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
            createStateView(map,attributes);
        }
    });
};
// function to initialize the map build
$(document).ready(createMap);