'use strict';

var el = app.data.mayorMobile;
var items = {
    data: [],
    pageSize: 0
};
var views = {
    default: "start-report-view",
    views: ["start-report-view", "prev-next", "steps-view", "photos-view", "location-view", "comment-view", "user-info-view"],
    active: null
}

app.formView = kendo.observable({
    onShow: function () {
        var location = new Geolocation();
        views.active = null;
        checkLogin();
        initializeViews();
        location.getCityInfo(function (locationData) {
            var locationInfo = new kendo.data.DataSource({
                data: [locationData]
            });
            var t = $("#listView").data("kendoMobileListView");
            t.setDataSource(locationInfo);
            t.refresh();
            console.log(locationData);
        });
    },
    afterShow: function () {}
});

(function (parent) {
    var formViewModel = kendo.observable({
        fields: {},
        submit: function () {},
        cancel: function () {},
        takePhoto: function () {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
            });
        },
        prev: function () {
            if (!(views.active === 3)) {
                views.active--;
                initializeViews()
                if (views.active === 4) {
                    loadMap();
                }
            }
        },
        next: function () {
            if (!(views.active === views.views.length - 1)) {
                views.active++;
                initializeViews()
                if (views.active === 4) {
                    loadMap();
                }
            }
        }
    });
    parent.set('formViewModel', formViewModel);
})(app.formView);

function checkLogin() {
    el.Users.currentUser(function (data) {
        if (data.result) {
            var username = data.result.DisplayName;
            alert(username + " is logged in!");
        } else {
            setTimeout(function () {
                app.mobileApp.navigate('components/authenticationView/view.html');
            }, 0);
        }
    }, function (err) {
        alert(err.message + " Please log in.");
    });
};

function onSuccess(imageData) {

    items.data.push({
        img: imageData
    });
    items.pageSize = items.data.length;
    var ds = new kendo.data.DataSource(items);
    var scrollView = $("#scrollview").data("kendoMobileScrollView");
    scrollView.setDataSource(ds);
    views.active = 3;
    initializeViews();
    scrollView.refresh();
    //var smallImage = document.getElementById('smallImage'); //<div data-role="page"><img style="width:100%" id="smallImage" src="" /></div>
    //smallImage.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function initializeViews() {
    var view;
    views.active ? view = views.active : view = 0;
    views.views.forEach(function (e, i) {
        if (view === i) {
            $('.' + views.views[i]).show();
            if (views.active) {
                $('.' + views.views[1]).show();
                $('.' + views.views[2]).show();
            }
        } else {
            $('.' + views.views[i]).hide();
        }
    })
}

function loadMap() {
    var l = new Geolocation();
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
    });
}

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