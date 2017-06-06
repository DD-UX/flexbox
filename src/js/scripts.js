/**
 * Google Analytics Script
 * */

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-96023281-1', 'auto');
ga('send', 'pageview');

/**
 * END - Google Analytics Script
 * */


/**
 * Mobile menu hide
 * */

var $body = $("body");
// Mobile hide tooltips touching elsewhere
$body.on("touchstart", mobileHideNavbar);

function mobileHideNavbar (e){
        var navbar = $(".navbar-collapse");
        var navbarToggler = $(".navbar-toggler");

        if(
            (!$(e.target).parents().is(".navbar") && !$(e.target).is(".navbar")) &&
            (navbar.hasClass("show") || !navbarToggler.hasClass("collapsed"))
        ){
                navbar.removeClass("show");
                navbarToggler.addClass("collapsed");
        }

}