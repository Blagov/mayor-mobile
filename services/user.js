'use strict';

class User{

    constructor() {
		this.user = null;
        this.location = null;
    }
    
    static login(callback){
        var self = this;
        var el = app.data.mayorMobile;
        el.Users.currentUser(function (data) {
            if (data.result) {
                self.user = data.result;
            } else {
                var err = "Not authenticated";
                console.log(err);
            }
            if(self.location == null){
                self.setUserLocation(function(){
                	callback(null);
                });
            }else{
                callback(null);
            }
        }, function (err) {
			callback(err);
        });
    }
    
    static logout(callback){
        var self = this;
        var el = app.data.mayorMobile;
        el.Users.logout()
        .then(function() {
            self.user = null;
            callback(null);
        },
        function () {
            callback('Failed logout');
        });  
    }
    
    static setUserLocation(callback){
        var self = this;
        if(this.location == null){
            var geolocation = new Geolocation();
            geolocation.getCityInfo(function(location){
                self.location = location;
                callback();
            });
        }
    }
    
    static getUser(){
        return this.user;
    }
    
    static getUserLocation(){
        return this.location;
    }
}