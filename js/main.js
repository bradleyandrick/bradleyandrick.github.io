
/*window.addEvent('scroll',function(e) {
    document.getElementById("scrollText").style.display = "none";
    document.getElementById("downArrow").style.display = "none";
    
});*/


$(window).scroll(function() {
    if ($(this).scrollTop()>1)
     {
        $("#scrollText").fadeOut(400);
        $("#downArrow").fadeOut(400);

     }
    else
     {
       $("#scrollText").fadeIn(400);
        $("#downArrow").fadeIn(400);
     }
 });


$("#aboutBtn").on('click', function(event) {
    $('html, body').animate({
        scrollTop: $("#aboutContainer").offset().top
    }, 1000);
});

$("#portfolioBtn").on('click', function(event) {
    $('html, body').animate({
        scrollTop: $("#PortfolioDiv").offset().top
    }, 1500);
});

$("#resumeBtn").on('click', function(event) {
    $('html, body').animate({
        scrollTop: $("#ResumeDiv").offset().top
    }, 2000);
});