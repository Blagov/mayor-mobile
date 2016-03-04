'use strict'; 

app.home = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

 
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {
	navigator.splashscreen.hide();
    geolocationApp = new geolocationApp();
	geolocationApp.run();
    
}
 
function geolocationApp() {
}

geolocationApp.prototype = {
	_watchID:null,
    
	run:function() {
		var that = this;
		that._handleWatch.apply(that, arguments);
	},    
	_handleWatch:function() {
		var that = this;
        var options = {
            frequency: 1000,
            enableHighAccuracy: true
        };
        that._watchID = navigator.geolocation.watchPosition(function() {
            that._onSuccess.apply(that, arguments);
        }, function() {
            that._onError.apply(that, arguments);
        }, options);
	},
    
	_onSuccess:function(position) {
		// Successfully retrieved the geolocation information. Display it all.
        
		this._setResults('Latitude: ' + position.coords.latitude + '<br />' +
						 'Longitude: ' + position.coords.longitude + '<br />');
	},
    
	_onError:function(error) {
		this._setResults('code: ' + error.code + '<br/>' +
						 'message: ' + error.message + '<br/>');
	},
    
	_setResults:function(value) {
		if (!value) {
			document.getElementById("results").innerHTML = "";
		}
		else {
            //console.log(value);
			$("#results").html(value);
		}
	},
}