'use strict';

app.home = kendo.observable({
    onShow: function () {
        var l = new geolocation();
        var center, map, mapProp, mark;
        var infowindow = new google.maps.InfoWindow({
            content: "Hello World!"
        });

        navigator.splashscreen.hide();
        if (navigator.geolocation.lastPosition) {
            center = new google.maps.LatLng(navigator.geolocation.lastPosition.coords.latitude, navigator.geolocation.lastPosition.coords.longitude);
            mapProp = {
                center: center,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        } else {
            center = new google.maps.LatLng(42.697708, 23.321868);
            mapProp = {
                center: center,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        }
        map = new google.maps.Map(document.getElementById("map"), mapProp);
        mark = new google.maps.Marker({
            position: center,
        });
        mark.setMap(map);

        google.maps.event.addListener(mark, 'click', function () {
            infowindow.open(map, mark);
        });
        l.getLocation(function (position, error) {
            if (error) {
                var html = 'Err code: ' + error.code + '<br />' + 'message: ' + error.message + '<br />'
            } else {
                var c = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(c);
                map.setZoom(15)
                mark.setPosition(c);
                geocode(c, function (results) {
                    console.log(results[0]);
                    infowindow.content = results[0].formatted_address;
                });
                var html = 'Latitude: ' + position.coords.latitude + '<br />' + 'Longitude: ' + position.coords.longitude + '<br />'
            }

            $("#results").html(html);
        });
    }
});

function geocode(coords, cb) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'location': coords
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                cb(results);
            } else {
                //window.alert('No results found');
            }
        } else {
            // window.alert('Geocoder failed due to: ' + status);
        }
    });
}