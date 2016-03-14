'use strict';

var height;
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
var sendData = {
    userId: null,
    state: null,
    location: {
        longitude: null,
        latitude: null
    },
    pcategory: null,
    comment: null,
    files: []
}

app.formView = kendo.observable({
    onShow: function (e) {
        height = e.view.content[0].clientHeight;
        views.active = null;
        checkLogin();
        initializeViews();
        cityInfo("cityInfo");
    }
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
            }
        },
        next: function () {
            if (!(views.active === views.views.length - 1)) {
                views.active++;
                initializeViews()
            }
        },
        send: function () {
            sendData.pcategory = $("input[type=radio]:checked").val();
            sendData.comment = $(".comment").val();
            //console.log(sendData);
            var data = app.data.mayorMobile.data('Problems');
            data.create({
                    Comment: sendData.comment,
                    Region: sendData.state,
                    Category: sendData.pcategory,
                    Followers: 0,
                    Latitude: sendData.location.latitude,
                    Longitude: sendData.location.longitude,
                    Status: 0,
                    Owner: sendData.userId

                },
                function (data) {
                    var images = app.data.mayorMobile.data('Images');
                    sendData.files.forEach(function (img, i) {

                        var file = {
                            "ContentType": "image/jpeg",
                            "base64": "data:image/jpeg;base64," + img
                        };

                        images.create({
                                Image: file,
                                Problem: data.result.Id
                            },
                            function (data) {
                                if (i == sendData.files.length - 1) {
                                    alert("Успех!");
                                    app.mobileApp.navigate('components/home/view.html');
                                    items = {
                                        data: [],
                                        pageSize: 0
                                    };
                                    sendData = {
                                        userId: null,
                                        state: null,
                                        location: {
                                            longitude: null,
                                            latitude: null
                                        },
                                        pcategory: null,
                                        comment: null,
                                        files: []
                                    }

                                }
                            },
                            function (error) {
                                console(error);
                            });
                    })
                },
                function (error) {
                    console.log(error);
                });
        }
    });
    parent.set('formViewModel', formViewModel);
})(app.formView);

function checkLogin() {
    el.Users.currentUser(function (data) {
        if (data.result) {
            var username = data.result.DisplayName;
            //alert(username + " is logged in!");
        } else {
            app.mobileApp.navigate('components/authenticationView/view.html');
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
    sendData.files.push(imageData);
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function initializeViews() {
    var view;
    views.active ? view = views.active : view = 0;
    switch (views.active) {
        case 4:
            loadMap();
            break;
        case 5:
            getCategories();
            break;
        case 6:
            cityInfo("city");
            userInfo();
            break;
    }
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
    if (views.active >= 3 && views.active < 6) {
        $(".navigation").show();
        $(".send").hide();
        steps();
    } else if (views.active == 6) {
        $(".navigation").hide();
        $(".send").show();
        steps();
    }
}

function loadMap() {
    var center, map, mapProp, mark;
    var location = new Geolocation();
    var infowindow = new google.maps.InfoWindow({
        content: "Добре Дошли!"
    });

    location.getLocation(function (locData) {
        center = new google.maps.LatLng(locData.coords.latitude, locData.coords.longitude);
        mapProp = {
            center: center,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapProp);
        mark = new google.maps.Marker({
            position: center,
        });
        mark.setMap(map);

        google.maps.event.addListener(mark, 'click', function () {
            infowindow.open(map, mark);
        });
        geocode(center, function (results) {
            infowindow.content = results[0].formatted_address;
        });
        $("#map").height(height - $('.steps-view').height());
        sendData.location.latitude = locData.coords.latitude;
        sendData.location.longitude = locData.coords.longitude;
    })
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

function cityInfo(v) {
    var location = new Geolocation();
    location.getCityInfo(function (locationData) {
        var template = kendo.template("<h5>Област: #= state #</h5><h6>Град: #= city #</h6>");
        var result = template(locationData);
        $("#" + v).html(result);
        sendData.state = locationData.state;
    });
}

function getCategories() {
    var data = el.data('Categories');
    data.get()
        .then(function (data) {
                var template = kendo.template("# for (var i = 0; i < data.length; i++) { #<li class='col-xs-6'><div class='radio'><label><input style='margin-left: -35px;margin-top: -5px;' type='radio' name='category' value='#= data[i].Id #'>#= data[i].Name #</label></div></li># } #");
                var result = template(data.result);
                $("#categories").html(result);
            },
            function (error) {
                console.log("err", error);
            });
}

function userInfo() {
    el.Users.currentUser(function (data) {
        var template = kendo.template("<li>Username:#= DisplayName #</li><li>Email:#= Email #</li>");
        var result = template(data.result);
        $("#userInfo").html(result);
        sendData.userId = data.result.Id;
    }, function (err) {
        alert(err.message + " Please log in.");
    });
}

function steps() {
    var steps = $('.steps-view').children();
    steps.each(function (i) {
        if (i === views.active - 3) {
            $(this).addClass("active-step");
        } else {
            $(this).removeClass("active-step");
        }
    })
}