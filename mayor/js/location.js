'use strict';

var geolocation = function(){

}

geolocation.prototype = {
	_watchID:null,
    
	getLocation:function(cb) {
        var that = this;
        var options = {
            frequency: 1000,
            enableHighAccuracy: true
        };
        navigator.geolocation.watchPosition(function(position) {
            cb(position, null)
        }, function(error) {
             cb(null, error)
        }, options);
	}
    
}