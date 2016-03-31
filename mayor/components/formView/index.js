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
    address: null,
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
        startReportView(e);
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
            $(".spinner").show();
            sendData.pcategory = $("input[type=radio]:checked").val();
            sendData.comment = $(".comment").val();
            //console.log(sendData);
            var data = app.data.mayorMobile.data('Problems');
            data.create({
                    Comment: sendData.comment,
                    Region: sendData.state,
                    Category: sendData.pcategory,
                    Latitude: sendData.location.latitude,
                    Longitude: sendData.location.longitude,
                    Status: 0,
                    Owner: sendData.userId,
                    Address: sendData.address

                },
                function (data) {
                    var images = app.data.mayorMobile.data('Images');
                    sendData.files.forEach(function (img, i) {
                        var file = {
                            "Filename": "image.jpg",
                            "ContentType": "image/jpeg",
                            "base64": img
                        }
                        app.data.mayorMobile.files.create(file,
                            function (f) {
                                images.create({
                                        Problem: data.result.Id,
                                        Url: f.result.Uri
                                    },
                                    function (img) {
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
                                                files: [],
                                                address: null
                                            }

                                        }
                                    },
                                    function (error) {
                                        console.log(error);
                                    });

                            },
                            function (error) {
                                console.log(error);
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
            //console.log(data);
            //alert(username + " is logged in!");
        } else {
            app.mobileApp.navigate('components/authenticationView/view.html');
        }
    }, function (err) {
        alert(err.message + " Please log in.");
    });
};

function onSuccess(imageData) {

    rotateImage(imageData, function (i) {
        items.data.push({
            img: i
        });
        items.pageSize = items.data.length;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#scrollview").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        views.active = 3;
        initializeViews();
        //console.log(scrollView);
        sendData.files.push(i);
        setTimeout(function () {
            scrollView.refresh();
        }, 500);
    });
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function initializeViews() {
    var view;
    views.active ? view = views.active : view = 0;
    switch (views.active) {
        case 3:
            removeStartReportView();
            break;
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

    location.getCityInfo(function (locData) {
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
        infowindow.content = locData.address;
        $("#map").height(height - $('.steps-view').height());
        sendData.location.latitude = locData.coords.latitude;
        sendData.location.longitude = locData.coords.longitude;
        sendData.address = locData.address;
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
        var template = kendo.template("<h3>#= state #</h3>");
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

function rotateImage(i, cb) {
    var image = new Image();
    image.src = "data:image/jpeg;base64," + i;
    setTimeout(function () {
        if (image.height > image.width) {
            //alert('in');
            var canvas = document.createElement("canvas");
            canvas.width = image.height;
            canvas.height = image.width;
            var cw = canvas.width * 0.5;
            var ch = canvas.height * 0.5;
            var ctx = canvas.getContext("2d");
            ctx.translate(cw, ch);
            ctx.rotate(90 * Math.PI / 180);
            ctx.translate(-image.width * 0.5, -image.height * 0.5);
            ctx.drawImage(image, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            var jpegUrl = canvas.toDataURL("image/jpeg");
            jpegUrl = jpegUrl.slice(23, jpegUrl.length);
            cb(jpegUrl);
        } else {
            cb(i);
        }
    }, 500);
}

function takePhoto() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 30,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
}

function startReportView(e) {
    $('#report-view').css('background', 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("images/temp/2110273938.jpg")');
    $('header .km-tabstrip').css('background-image', 'linear-gradient(rgba(255, 255, 255, 0) 0px, rgba(199, 199, 199, 0.06) 100%)');
    $('.km-nova .km-tabstrip .km-button.km-state-active').css('background-image', 'linear-gradient(rgba(255, 255, 255, 0) 0px, rgba(255, 250, 250, 0) 100%)');
    $('.km-nova .km-tabstrip .km-button').css('color', 'rgba(255, 255, 255, 0.85)');
    $('*[data-role="content"]').css('background-color', 'rgba(199, 199, 199, 0.06)');
}