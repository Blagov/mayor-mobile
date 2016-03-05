'use strict'; 

app.home = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

 
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {
    navigator.splashscreen.hide();
    var l  = new geolocation();
	l.getLocation(function(position, error){
        if(error){
            var html = 'Err code: ' + error.code + '<br />' +'message: ' + error.message + '<br />'
        }else{
            var html = 'Latitude: ' + position.coords.latitude + '<br />' +'Longitude: ' + position.coords.longitude + '<br />'
        }
       
        $("#results").html(html);
    });
   
}
 