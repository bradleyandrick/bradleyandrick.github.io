
// Scroll for index page footer image click
$("#footImageHome").click(function(){
    
   window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
});

//quiz button clicks here:
$("#submitQuiz").click(function(){
    var returnedNumber = calcQuizWeights();
    var answerText = "Try looking at: <br><br>"
   $("#quizAnswer").html(returnedNumber);
});

//function called to get quiz answers and weights
function calcQuizWeights(){
    var number = 4;
    var hasUndefined = false;

    var contactUs = 0;
    var useEsri = 0;
    var allCustom = 0;
    var collectData = 0;

    var myRadio1 = $('input[name="radio1"]');
    var question1 = myRadio1.filter(":checked").val();

    if (question1 == undefined){
       hasUndefined = true;
    }else{
       if (question1 == "1_1"){
           contactUs ++;
       }else if (question1 == "1_2"){
           useEsri ++;
       }else if(question1 == "1_3"){
           useEsri ++;
       }else if(question1 == "1_4"){
           useEsri ++;
       }
    }
    
    var myRadio2 = $('input[name="radio2"]');
    var question2 = myRadio2.filter(":checked").val();

    if (question2 == undefined){
       hasUndefined = true;
    }else{
       if (question2 == "2_1"){
           contactUs ++;
       }else if (question2 == "2_2"){
           useEsri ++;
       }else if(question2 == "2_3"){
           useEsri ++;
       }else if(question2 == "2_4"){
           contactUs ++;
       }
    }

    var myRadio3 = $('input[name="radio3"]');
    var question3 = myRadio3.filter(":checked").val();

    if (question3 == undefined){
       hasUndefined = true;
    }else{
       if (question3 == "3_1"){
           contactUs ++;
       }else if (question3 == "3_2"){
           useEsri ++;
       }else if(question3 == "3_3"){
           contactUs ++;
       }else if(question3 == "3_4"){
           allCustom ++;
       }
    }
    
    var myRadio4 = $('input[name="radio4"]');
    var question4 = myRadio4.filter(":checked").val();

    if (question4 == undefined){
       hasUndefined = true;
    }else{
       if (question4 == "4_1"){
           useEsri ++;
       }else if (question4 == "4_2"){
           useEsri ++;
       }else if(question4 == "4_3"){
           collectData ++;
       }else if(question4 == "4_4"){
           contactUs ++;
       }
    }
    
    var myRadio5 = $('input[name="radio5"]');
    var question5 = myRadio5.filter(":checked").val();

    if (question5 == undefined){
       hasUndefined = true;
    }else{
       if (question5 == "5_1"){
           contactUs ++;
       }else if (question5 == "5_2"){
           useEsri ++;
       }else if(question5 == "5_3"){
           useEsri ++;
       }else if(question5 == "5_4"){
           useEsri ++;
       }
    }
    
    if (hasUndefined){
        number = "Need to finish answers! Try again.";
    }else if(allCustom > 0){
             number = "Looks like you need some serious customization!<br><a href='./contact.html'>Contact us for a custom solution.</a>"
    }else if(collectData > 0){
        number = "<a href='./501collector.html'>Try the MAP 501 app for simple point data collection.</a> <a href='https://www.esri.com/en-us/industries/sustainability/nonprofit-program/overview' target='_blank'>Esri's non-profit program might be helpful too!</a>"
    }else{
        
        var selectedValues = [contactUs, useEsri];
        var selectedValuesNoZeros = [];
        
        for (var x in selectedValues) {
            
          if (selectedValues[x] !=0){
              selectedValuesNoZeros.push(selectedValues[x]);
          }
        }
        
        var hasDups = hasDuplicates(selectedValuesNoZeros);

        if (hasDups){
            number = "Looks like you have some unique requirements. <br> <a href='https://www.esri.com/en-us/industries/sustainability/nonprofit-program/overview' target='_blank'>Look at the Esri Nonprofit website and contact us for further assitance.</a>"; 
        }else{
            var getHighestChoice = Math.max(contactUs, useEsri);

            if (contactUs == getHighestChoice){
                number = "Looks like the best choice is a consultation!<br>Go to the contact page on this site and drop us a line, we can help move you in the right direction. <a href='./contact.html'>Contact us here</a>";
            }else if (useEsri == getHighestChoice){
                number = "Looks like Esri's non-profit program might be the best route to get started. <a href='https://www.esri.com/en-us/industries/sustainability/nonprofit-program/overview' target='_blank'>Find more here</a>";
            }else if (tryQGIS_Open == getHighestChoice){
                number = "tryQgis";
            }else if (useArcGISOnline == getHighestChoice){
                number = "useArcGIS Online";
            }
        }
    }

  return number;
}

//function called to find duplicates
function hasDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
}

// functions to handle accordion clicks on faq page
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display == 'flex'){
        panel.style.display = 'none';
    } else {
      //panel.style.maxHeight = panel.scrollHeight + "px";
        panel.style.display = 'flex';
    } 
  });
}

