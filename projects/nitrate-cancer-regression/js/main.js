var map;

var censusTractsGroup = L.layerGroup();
var wellPointsGroup = L.layerGroup();
var nitrateGroup = L.layerGroup();
var cancerGroup = L.layerGroup();
var regressionGroup = L.layerGroup();

// Initialize global variables for data layers
var censusDataLayer;
var wellDataLayer;
var nitrateDataLayer;
var cancerDataLayer;
var regressionDataLayer;

// Initialize arrays to store the well points, census tracts, interpolated nitrate concentrations, interpolated cancer rates, and predicted and observed cancer rates
var wellPointsArray = [],
    censusTractsArray = [],
    interpolatedNitrateRatesArray = [],
    interpolatedCancerRatesArray = [],
    observedNitrateAndCancerRatesArray = [],
    interpolatedNitrateAndCancerRatesArray =[];

// Initialize global variables for the Turf.js feature collections
var censusTractFeatureCollection,
    wellPointsFeatureCollection,
    nitrateRatesHexbinsTurf,
    cancerRatesBins,
    cancerRatesBinPoints,
    collectedFeaturesHexbinsTurf;

var nitrateLegend,
    cancerLegend,
    regressionLegend;  

var overlayCalculatedLayers = {
    "Regression Analysis": regressionGroup,
    "Nitrate Concentrations \(Interpolated\)": nitrateGroup,
    "Cancer Rates \(Interpolated\)": cancerGroup
};

function createMap(){
    // create map object
    map = L.map('map', { zoomControl:false, minZoom:1, layers: [censusTractsGroup, wellPointsGroup, nitrateGroup,cancerGroup,regressionGroup] }).setView([44.678071, -90.730658], 7);  

    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 22,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmlja2JhIiwiYSI6Imt3R0xyX28ifQ.uhO4WhpGtSyJ5gHtUBuAKQ'
    }).addTo(map); 
}

//load data
function loadStartingJSON(){
    $.getJSON("data/cancer_tracts.json", function (data) {

        censusDataLayer = L.geoJson(data, {
            style: function (feature) {
                return {
                    color: '#d3d3d3', 
                    weight: 0.3, 
                    fillOpacity: 0.5, 
                    opacity: 1
                };
            }
        }).addTo(censusTractsGroup);
        
        // add well data
        $.getJSON("data/well_nitrate.json", function (data) {

            wellDataLayer = L.geoJson(data, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        fillColor: '#236B8E',
                        fillOpacity: 1,
                        color: '#282828',
                        weight: 0.25,
                        opacity: 1,
                        radius: 2.5
                    });
                }
            }).addTo(wellPointsGroup);
        });
    });
}

// build turf layer
function interpolateNitrateRates(k, binInput) {
 
    if (nitrateGroup !== undefined) {
        nitrateGroup.clearLayers();
    }
    
    // Loop through each feature
    wellDataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;
        var coordinates = layer.feature.geometry.coordinates;
        
        var wellPointsFeature = turf.point(coordinates, props);

        wellPointsArray.push(wellPointsFeature);

    });

    wellPointsFeatureCollection = turf.featureCollection(wellPointsArray);

    var options = {
        gridType: 'hex', 
        property: 'nitr_ran',
        units: 'miles', 
        weight: k 
    };

    nitrateRatesHexbinsTurf = turf.interpolate(wellPointsFeatureCollection, binInput, options);

    for (var hexbin in nitrateRatesHexbinsTurf.features) {
        var interpolatedNitrateRate = nitrateRatesHexbinsTurf.features[hexbin].properties.nitr_ran;
        
        interpolatedNitrateRatesArray.push(interpolatedNitrateRate);
        
    }
    
    nitrateDataLayer = L.geoJson(nitrateRatesHexbinsTurf, {

        style: function (feature) {
            return {
                color: '#585858', 
                weight: 0.5, 
                fillOpacity: 0.6, 
                opacity: 0.5 
            };
        }

    }).addTo(nitrateGroup);
    
    var breaks = getNitrateRateClassBreaks(nitrateDataLayer);

    nitrateDataLayer.eachLayer(function (layer) {

        layer.setStyle({
            fillColor: getNitrateRateColor(layer.feature.properties.nitr_ran, breaks)
        });

        var popup = "<b>Nitrate Level Recorded: </b>" + layer.feature.properties.nitr_ran.toFixed(2) + " ppm";

        layer.bindPopup(popup);

    });
    
    map.addLayer(nitrateDataLayer);
    
    nitrateDataLayer.bringToFront();
    
    nitrateDataLayer.remove();

    drawNitrateRatesLegend(breaks);

} 


// Set color of features
function getNitrateRateColor(d, breaks) {

    if (d <= breaks[0][1]) {
        return '#f1eef6';

    } else if (d <= breaks[1][1]) {
        return '#bdc9e1';

    } else if (d <= breaks[2][1]) {
        return '#74a9cf';

    } else if (d <= breaks[3][1]) {
        return '#2b8cbe';

    } else if (d <= breaks[4][1]) {
        return '#045a8d';

    }
} 


// set class breaks
function getNitrateRateClassBreaks(nitrateRatesDataSource) {

    var values = [];

    nitrateRatesDataSource.eachLayer(function (layer) {
        var value = layer.feature.properties.nitr_ran;

        values.push(value);
    });

    var clusters = ss.ckmeans(values, 5);

    var breaks = clusters.map(function (cluster) {
        return [cluster[0], cluster.pop()];
    });
    
    return breaks;

} 


// Create the legend for nitrate concentrations  
function drawNitrateRatesLegend(breaks) {
    
        var div = L.DomUtil.create('div', 'legend');

        div.innerHTML = "<h3><b>Nitrate Levels \(ppm\)</b></h3>";

        for (var i = 0; i < breaks.length; i++) {

            var color = getNitrateRateColor(breaks[i][0], breaks);

            div.innerHTML +=
                '<span style="background:' + color + '"></span> ' +
                '<label>' + parseFloat(breaks[i][0]).toFixed(2).toLocaleString() + ' &mdash; ' +
                parseFloat(breaks[i][1]).toFixed(2).toLocaleString() + '</label>';

        }  
    
    $("#legendHolderNitrate").append(div);


} 


//build turf layer
function interpolateCancerRates(k, binInput) {

    if (cancerGroup !== undefined) {
        cancerGroup.clearLayers();
    }
    
    censusDataLayer.eachLayer(function (layer) {

        var props = layer.feature.properties;
        var coordinates = layer.feature.geometry.coordinates;

        var censusTractsFeature = turf.polygon(coordinates, props);

        var censusTractsCentroidFeature = turf.centroid(censusTractsFeature, props);

        censusTractsArray.push(censusTractsCentroidFeature);

    });

    censusTractFeatureCollection = turf.featureCollection(censusTractsArray);

    var options = {
        gridType: 'hex', 
        property: 'canrate', 
        units: 'miles', 
        weight: k 
    };

    cancerRatesBins = turf.interpolate(censusTractFeatureCollection, binInput, options);
    
    var optionsPoints = {
        gridType: 'point', 
        property: 'canrate', 
        units: 'miles', 
        weight: k 
    };
    
    cancerRatesBinPoints = turf.interpolate(censusTractFeatureCollection, binInput, optionsPoints);

    for (var bin in cancerRatesBins.features) {
        var interpolatedCancerRate = cancerRatesBins.features[bin].properties.canrate;
        
        interpolatedCancerRatesArray.push(interpolatedCancerRate);
        
    }
    
    cancerDataLayer = L.geoJson(cancerRatesBins, {

        style: function (feature) {
            return {
                color: '#585858', 
                weight: 0.5, 
                fillOpacity: 0.6, 
                opacity: 0.5 
            };
        }

    }).addTo(cancerGroup);
    
    
    var breaks = getCancerRateClassBreaks(cancerDataLayer);

    cancerDataLayer.eachLayer(function (layer) {

        layer.setStyle({
            fillColor: getCancerRateColor(layer.feature.properties.canrate, breaks)
        });

        var popup = "<b>Cancer Rate Recorded: </b>" + Math.round(layer.feature.properties.canrate.toFixed(2) * 100) + "%";

        layer.bindPopup(popup);

    });
    
    map.addLayer(cancerDataLayer);
    
    cancerDataLayer.bringToFront();
    
    cancerDataLayer.remove();
    
    
    //END BLOCK CALL AT LAST FUNCTION RETURN
    $('#clearButton').fadeIn(500);
    $('#customlayercontrol').fadeIn(500);
    $('#loadingHolder').fadeOut(500);
    
    runRegression();
    
    // Draw the legend for the nitrate concentration hexbins
    drawCancerRatesLegend(breaks);

}


// Set color of features 
function getCancerRateColor(d, breaks) {

    if (d <= breaks[0][1]) {
        return '#fef0d9';

    } else if (d <= breaks[1][1]) {
        return '#fdcc8a';

    } else if (d <= breaks[2][1]) {
        return '#fc8d59';

    } else if (d <= breaks[3][1]) {
        return '#e34a33';

    } else if (d <= breaks[4][1]) {
        return '#b30000';

    }
} 

// set class breaks
function getCancerRateClassBreaks(CancerRatesDataSource) {

    var values = [];

    CancerRatesDataSource.eachLayer(function (layer) {
        var value = layer.feature.properties.canrate;

        values.push(value);
    });

    var clusters = ss.ckmeans(values, 5);

    var breaks = clusters.map(function (cluster) {
        return [cluster[0], cluster.pop()];
    });
    
    return breaks;

}


// build legend for cancer layer
function drawCancerRatesLegend(breaks) {

        var div = L.DomUtil.create('div', 'legend');

        div.innerHTML = "<h3><b>Cancer Rate \(%\)</b></h3>";

        for (var i = 0; i < breaks.length; i++) {

            var color = getCancerRateColor(breaks[i][0], breaks);

            div.innerHTML +=
                '<span style="background:' + color + '"></span> ' +
                '<label>' + parseFloat(breaks[i][0] * 100).toFixed(2).toLocaleString() + '&mdash; ' +
                parseFloat(breaks[i][1] * 100).toFixed(2).toLocaleString() + '</label>';
        }

     $("#legendHolderCancerRate").append(div);


} 

//run regression functions
function runRegression(){
    
    collectedFeaturesHexbinsTurf = turf.collect(nitrateRatesHexbinsTurf, cancerRatesBinPoints, 'canrate', 'values');
    
        for (var i in collectedFeaturesHexbinsTurf.features) {

        var canrateArray = collectedFeaturesHexbinsTurf.features[i].properties.values;

        var canrateArraySum = 0;
        for (var j in canrateArray) {

            if (canrateArray.length > 0) {
                canrateArraySum += parseFloat(canrateArray[j]);
            }

        }

        var canrateArrayAvg = canrateArraySum / canrateArray.length;

        if (canrateArrayAvg !== undefined) {
            collectedFeaturesHexbinsTurf.features[i].properties.canrate = canrateArrayAvg;
        } else {
            collectedFeaturesHexbinsTurf.features[i].properties.canrate = "";
        }

    }
        
    for (var i in collectedFeaturesHexbinsTurf.features) {

        var props = collectedFeaturesHexbinsTurf.features[i].properties;

        var interpolatedNitrateConcentration = props.nitr_ran;
        var interpolatedCancerRate = props.canrate;

        var currentNitrateAndCancerRates = [parseFloat(interpolatedNitrateConcentration), parseFloat(interpolatedCancerRate)];

        interpolatedNitrateAndCancerRatesArray.push(currentNitrateAndCancerRates);

    }
    
    var regressionEquation = ss.linearRegression(interpolatedNitrateAndCancerRatesArray);
    
    var m = regressionEquation.m;
    var b = regressionEquation.b;
    
    var regressionEquationFormatted = "y = " + parseFloat(m).toFixed(5) + "x + " + parseFloat(b).toFixed(5);
    console.log("Regression Equation: " + regressionEquationFormatted);
    
    for (var j in collectedFeaturesHexbinsTurf.features) {

        var collectedFeatureHexbinProps = collectedFeaturesHexbinsTurf.features[j].properties;
        
        var collectedHexbinInterpolatedNitrateConcentration = collectedFeatureHexbinProps.nitr_ran;
        var collectedHexbinInterpolatedCancerRate = collectedFeatureHexbinProps.canrate;

        var predictedCancerRate = m * (parseFloat(collectedHexbinInterpolatedNitrateConcentration)) + b;

        var residual = predictedCancerRate - collectedHexbinInterpolatedCancerRate;

        collectedFeaturesHexbinsTurf.features[j].properties.predictedCancerRate = predictedCancerRate;
        collectedFeaturesHexbinsTurf.features[j].properties.residual = residual;
        
        var observedNitrateAndCancerRatesPair = [collectedHexbinInterpolatedNitrateConcentration, collectedHexbinInterpolatedCancerRate];
        
        observedNitrateAndCancerRatesArray.push(observedNitrateAndCancerRatesPair);

    }
    
    
     var regressionLine = ss.linearRegressionLine(regressionEquation);
    
    // Calculate the r-squared
    var rSquared = parseFloat(ss.rSquared(observedNitrateAndCancerRatesArray, regressionLine)).toFixed(5); // 1 is a perfect fit, 0 indicates no correlation
    console.log("r-Squared: " + rSquared);
    
     // Convert the collected hexbins to a Leaflet GeoJson layer 
    regressionDataLayer = L.geoJson(collectedFeaturesHexbinsTurf, {

        style: function (feature) {
            return {
                color: '#999999', 
                weight: 0.5, 
                fillOpacity: 0.5, 
                opacity: 0.5 
            };
        }

    }).addTo(regressionGroup);
    
    var breaks = getRegressionResidualClassBreaks(regressionDataLayer);

    regressionDataLayer.eachLayer(function (layer) {

        layer.setStyle({
            fillColor: getRegressionResidualColor(layer.feature.properties.residual, breaks)
        });

        if (getRegressionResidualColor(layer.feature.properties.residual, breaks) == '#f7f7f7') {
            layer.setStyle({
                fillOpacity: 0.4
            });
        }

        var popup = "<b>Nitrate Level \(ppm\): </b>" + layer.feature.properties.nitr_ran.toFixed(2) + "<br/>" +
            "<b>Observed Cancer Rate  \(%\): </b>" + (layer.feature.properties.canrate * 100).toFixed(2).toLocaleString() + "<br/>" +
            "<b>Predicted Cancer Rate \(%\): </b>" + (layer.feature.properties.predictedCancerRate * 100).toFixed(2).toLocaleString() + "<br>" +
            "<b>Residual: </b>" + layer.feature.properties.residual.toFixed(2);

        layer.bindPopup(popup);

    });

    // Move the regression residuals to the front
    regressionDataLayer.bringToFront();
      
    showRegressionChart();
        
    $('#ChartContainer').fadeIn(300);
    
    // Draw the legend for the regression residuals
    drawRegressionResidualsLegend(breaks);
     
}

// set class breaks
function getRegressionResidualClassBreaks(regressionFeaturesHexbins) {

    var values = [];

    regressionFeaturesHexbins.eachLayer(function (layer) {
        var value = layer.feature.properties.residual;

        values.push(value);
    });

    var standardDeviation = ss.sampleStandardDeviation(values);

    var breaks = [-2 * standardDeviation, -1 * standardDeviation, standardDeviation, 2 * standardDeviation];

    console.log("Standard Deviation of Residuals: " + parseFloat(standardDeviation).toFixed(5));

    return breaks;

}      

function getRegressionResidualColor(d, breaks) {

    if (d <= breaks[0]) {
        return '#7b3294';

    } else if (d <= breaks[1]) {
        return '#c2a5cf';

    } else if (d <= breaks[2]) {
        return '#f7f7f7';

    } else if (d <= breaks[3]) {
        return '#a6dba0';

    } else if (d > breaks[3]) {
        return '#008837';

    }
}

// set legend for residuals
function drawRegressionResidualsLegend(breaks) {

        var div = L.DomUtil.create('div', 'legend');

        div.innerHTML = "<h3>Residuals \(Std. Dev.\)</h3>";

        var colorMoreThanMinus2StdDev = getRegressionResidualColor(breaks[0], breaks);
        var colorMinus2ToMinus1StdDev = getRegressionResidualColor(breaks[1], breaks);
        var colorMinus1To1StdDev = getRegressionResidualColor(breaks[2], breaks);
        var color1To2StdDev = getRegressionResidualColor(breaks[3], breaks);
        var colorMoreThan2StdDev = '#008837';

        div.innerHTML +=
            '<span style="background:' + colorMoreThanMinus2StdDev + '"></span> ' +
            '<label>< -2 </label>';

        div.innerHTML +=
            '<span style="background:' + colorMinus2ToMinus1StdDev + '"></span> ' +
            '<label>-2 to -1 </label>';

        div.innerHTML +=
            '<span style="background:' + colorMinus1To1StdDev + '"></span> ' +
            '<label>-1 to 1</label>';

        div.innerHTML +=
            '<span style="background:' + color1To2StdDev + '"></span> ' +
            '<label>1 to 2 </label>';

        div.innerHTML +=
            '<span style="background:' + colorMoreThan2StdDev + '"></span> ' +
            '<label>> 2</label>';
    
    $("#legendHolderRegression").append(div);
    
    $('#legendHolderRegression').fadeIn(300);
    

}


function showRegressionChart(){
    
    var fixedArray = [];
    
    var data_1 = observedNitrateAndCancerRatesArray;
    
    for (arr in observedNitrateAndCancerRatesArray){
        var outerArray = observedNitrateAndCancerRatesArray[arr];
        var swappedArray = [outerArray[1], outerArray[0]];
        fixedArray.push(swappedArray);
    }
      
    //getting the regression object
    //the type of regression depends on the experimental data
    var result = regression('linear', fixedArray);

    //get coefficients from the calculated formula
    var coeff = result.equation;
    
    var data_2 = setTheoryData(fixedArray);

    chart = anychart.scatter();

    chart.title("Regression Plot \(R²\) = " + result.r2.toPrecision(4));
    
    // tune text
    var title = chart.title();
    // set font size
    title.fontSize(13);
    title.fontFamily("Cabin, sans-serif");
    
    // set the titles of the axes
    chart.xAxis().title("Cancer Rate \(%\)");
    chart.yAxis().title("Nitrate \(ppm\)");
    
    var titleX = chart.xAxis().title();
    var titleY = chart.yAxis().title();
    
    titleX.fontSize(12);
    titleX.fontFamily("Cabin, sans-serif");
    
    titleY.fontSize(12);
    titleY.fontFamily("Cabin, sans-serif");
     
    chart.xAxis().labels().format(function() {
      var value = this.value;
      // limit the number of symbols to 3
      value = value *100;
        value = Math.round(value);
      return value
    });

    // creating the first series (marker) and setting the experimental data
    var series1 = chart.marker(fixedArray);
    series1.name("Experimental data");
    series1.hover([]);
    series1.normal().stroke("#707070");
    series1.normal().fill("#707070");
    series1.hovered().fill("#707070");
    series1.hovered().stroke("#707070");
    series1.normal().size(2);
    series1.hovered().size(2);

    // creating the second series (line) and setting the theoretical data
    var series2 = chart.line(data_2);
    series2.name("Theoretically calculated data");
    series2.markers(false);
    //series2.normal().stroke("#8b0000");
    series2.normal().stroke("#545454");
    
    chart.container("ChartContainer");
    chart.draw();
    chart.tooltip(false);
    chart.background().fill("#d3d3d3");
    
    var interactivity = chart.interactivity();
    interactivity.selectionMode("none");
    
    //input X and calculate Y using the formula found
    //this works with all types of regression
    function formula(coeff, x) {
      var result = null;
      for (var i = 0, j = coeff.length - 1; i < coeff.length; i++, j--) {
        result += coeff[i] * Math.pow(x, j);
      }
      return result;
    }
//
//    //setting theoretical data array of [X][Y] using experimental X coordinates
//    //this works with all types of regression
    function setTheoryData(fixedArray) {
      var theoryData = [];
      for (var i = 0; i < fixedArray.length; i++) {
        theoryData[i] = [fixedArray[i][0], formula(coeff, fixedArray[i][0])];
      }
      return theoryData;
    }
    
}


//function to handle calculate button click
$( "#calculateButton" ).click(function() {     

    //reset the application 
    resetResults();
    
    //show loading image
    $('#loadingHolder').css('display','flex').hide().fadeIn();

    //remove and clear layers if there is any remaining data
    if (nitrateDataLayer !== undefined) {
        nitrateDataLayer.remove();
        nitrateGroup.clearLayers();
    }
    if (cancerDataLayer !== undefined) {
        cancerDataLayer.remove();
        cancerGroup.clearLayers();
    }
    if (regressionDataLayer !== undefined) {
        regressionDataLayer.remove();
        regressionGroup.clearLayers();
    }

    // call function to run the analysis - this is delayed 1 second to prevent blocking i/o
    setTimeout(function(){ callAnalysis();}, 1000);

});

//function to set up and run the analysis functions
function callAnalysis(){
    
    //edit text of calculate button
    document.getElementById("CalText").innerHTML = "RECALCULATE";
    
     // Use the JQuery select $() and val() methods to determine the value of the distance decay coefficient text box
    var k = $('#disInput').val();
    k = parseFloat(k);

    // Use the JQuery select $() and val() methods to determine the value of the hexbin size text box
    var binInput = $('#hexInput').val();
    binInput = parseFloat(binInput);

    interpolateNitrateRates(k,binInput); 
    interpolateCancerRates(k,binInput);
    
}


//function to handle clear button click
$( "#clearButton" ).click(function() {
    
    // call function to reset the app and map
    resetResults();
    
    // show bar telling user the data has been reset
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    
    //edit text of calculate button
    document.getElementById("CalText").innerHTML = "CALCULATE";
    
});

//function to reset the map and app
function resetResults(){
        
    //remove the clear button and custom layer control
    $('#clearButton').fadeOut(300);
    $('#customlayercontrol').fadeOut(300);
    
    // Hide the current legend
    $('.legend').hide();

    var radios = document.getElementById("regressionDataLayerID");
    radios.checked = true;

    nitrateGroup.clearLayers();
    cancerGroup.clearLayers();
    regressionGroup.clearLayers();

     if (nitrateDataLayer !== undefined) {
        nitrateDataLayer.remove();
    }

    if (cancerDataLayer !== undefined) {
        cancerDataLayer.remove();    
    }

    if (regressionDataLayer !== undefined) {
        regressionDataLayer.remove();  
    }

    //add code to hide and clear chart
    document.getElementById("ChartContainer").innerHTML = "";
    //remove the clear button and custom layer control
    $('#ChartContainer').fadeOut(300);

}


$('#customlayercontrol input[type="radio"]').on('change', function() {    
    var checkbox = $(this);
    var layer = checkbox.data().layer; 

    if (layer == "regressionDataLayer"){
        console.log("Match on: " + layer);
        map.addLayer(regressionDataLayer);
        map.removeLayer(nitrateDataLayer);
        map.removeLayer(cancerDataLayer);
        $('#legendHolderRegression').fadeIn(300);
        $('#legendHolderNitrate').fadeOut(100);
        $('#legendHolderCancerRate').fadeOut(100);    
    }else if(layer == "nitrateDataLayer"){
        console.log("Match on: " + layer);
        map.removeLayer(regressionDataLayer);
        map.addLayer(nitrateDataLayer);
        map.removeLayer(cancerDataLayer);
        $('#legendHolderNitrate').fadeIn(300);
        $('#legendHolderRegression').fadeOut(100);
        $('#legendHolderCancerRate').fadeOut(100);
    }else if(layer == "cancerDataLayer"){
        console.log("Match on: " + layer);
        map.removeLayer(regressionDataLayer);
        map.removeLayer(nitrateDataLayer);
        map.addLayer(cancerDataLayer);
        $('#legendHolderCancerRate').fadeIn(300);
        $('#legendHolderRegression').fadeOut(100);
        $('#legendHolderNitrate').fadeOut(100);   
    }
    
});


// function to initialize the page and map, called when the document is ready
$( document ).ready(function() {
    loadStartingJSON();
    createMap();
});
