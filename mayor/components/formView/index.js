'use strict';

var height, city;
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
        city = null;
        startReportView(e);
        height = e.view.content[0].clientHeight;
        views.active = null;
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
            city = null;
            sendData.pcategory = $(".activeCategory").data('id');
            sendData.comment = $(".comment").val();
            $(".comment").val('');
            var data = app.data.mayorMobile.data('Problems');
            var loc  = sendData.state;
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
                                            app.mobileApp.navigate('components/home/view.html');
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
			
            var query = new Everlive.Query();
            query.where()
                 .and()
                 .eq('Location', loc)
                 .eq('IsAdmin', true)
                 .done();
            app.data.mayorMobile.Users.get(query) // filter
                .then(function(data){
                   var mail = [];
                   var res  = data.result;
                   res.forEach(function(e){
                       mail.push(e.Email);
                   })	
                   if(mail.length > 0){
                   	var attributes = {
                        "Recipients": mail,
                        "Context": {
                            "CustomSubject": "Събщение1",
                            "PromoCode": "Събщение2",
                            "SpecialOffer": "Събщение3"
                        }
                    };
                    $.ajax({
                        type: "POST",
                        url: 'http://api.everlive.com/v1/Metadata/Applications/ju62wz48onyx8zei/EmailTemplates/72f13680-0ae8-11e6-9c49-41c60c75b824/send',
                        contentType: "application/json",
                        headers: {
                            "Authorization": "Masterkey MXZbAedFOTKflGFBHKo4EPhuTjPUM1QK"
                        },
                        data: JSON.stringify(attributes),
                        success: function(data) {
                            alert("Email successfully sent.");
                        },
                        error: function(error) {
                            alert(JSON.stringify(error));
                        }
                    })
                   }
                },
                function(error){
                    alert(JSON.stringify(error));
                });
        }
    });
    parent.set('formViewModel', formViewModel);
})(app.formView);

function checkLogin(e) {
    var user = User.getUser();
    if(user == null){
         e.preventDefault();
         app.mobileApp.navigate('components/authenticationView/view.html');
    }
};

function onSuccess(imageData) {
    views.active = 3;
    initializeViews();
    $(".spinner").show();
    rotateImage(imageData, function (i) {
        items.data.push({
            img: i
        });
        items.pageSize = items.data.length;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#scrollview").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        sendData.files.push(i);
        setTimeout(function () {
            scrollView.refresh();
            $(".spinner").hide();
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
            $(".spinner").show();
            loadMap();
            break;
        case 5:
            $(".spinner").show();
            getCategories();
            break;
        case 6:
            if ($(".activeCategory").data('id') == null) {
                views.active = views.active - 1;
                view = views.active;
                alert("Изберете категория!");
            } else {
                $(".spinner").show();
                cityInfo("city");
                userInfo();
            }
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

    location.getCityInfo(function (locData) {
        var infowindow = new google.maps.InfoWindow({
        	content: locData.address
   		});
        center = new google.maps.LatLng(locData.coords.latitude, locData.coords.longitude);
        mapProp = {
            center: center,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("locationMap"), mapProp);
        mark = new google.maps.Marker({
            position: center,
        });
        mark.setMap(map);
        google.maps.event.addListener(mark, 'click', function () {
            infowindow.open(map, mark);
        });
        $("#locationMap").height(height - $('.steps-view').height());
        sendData.location.latitude = locData.coords.latitude;
        sendData.location.longitude = locData.coords.longitude;
        sendData.address = locData.address;
        $(".spinner").hide();
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
    if(city == null){
        var location = new Geolocation();
    	location.getCityInfo(function (locationData) {
            var template = kendo.template("<h3>#= state #</h3>");
            var result = template(locationData);
            $("#" + v).html(result);
            sendData.state = locationData.state;
            $(".spinner").hide();
            city = locationData;
    	});
    }else{
        var template = kendo.template("<h3>#= state #</h3>");
        var result = template(city);
        $("#" + v).html(result);
        sendData.state = city.state;
        $(".spinner").hide();
    }
}

function getCategories() {
    var data = el.data('Categories');
    var filter = new Everlive.Query();
    filter.orderDesc('CreatedAt');
    data.get(filter)
        .then(function (data) {
            var template = kendo.template('# for (var i = 0; i < data.length; i++) { #<div data-id="#=data[i].Id#" onclick="selectCategory(this);" class="col-3  #=categoryClass(i)#"><span class="km-icon km-icon-#=data[i].IconName #"></span><h5>#=data[i].Name #</h5></div># } #');
            var result = template(data.result);
            $("#categories").html(result);
            $(".spinner").hide();
        },
        function (error) {
            console.log("err", error);
        });
}

function userInfo() {
    var user = User.getUser();
    var template = kendo.template("<div><label>Име</label>#= DisplayName #</div><div><label>Телефон</label>#= Phone #</div><div><label>Ел. поща</label>#= Email #</div>");
    var result = template(user);
    $("#userInfo").html(result);
    sendData.userId = user.Id;
}

function steps() {
    var steps = $('.steps-view').children();
    steps.each(function (i) {
        if (i <= views.active - 3) {
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
    $('.km-nova .km-content').css({'background':'rgba(0, 0, 0, 0.7)'});
    $('.km-nova header .km-tabstrip').css({'background':'rgba(0, 0, 0, 0.7)'});
    $('.km-nova header .km-tabstrip .km-button').css({'background':'transparent'});
}
function removeStartReportView() {
    $('.km-nova .km-content').css({'background':'rgba(243, 243, 243, 1)'});
    $('.km-nova header .km-tabstrip').css({'background':'rgba(255, 255, 255, 1)'});
    $('.km-nova header .km-tabstrip .km-button').css({'background':'rgba(255, 255, 255, 1)'});
}

function categoryClass(i) {
    if ((i + 1) % 4 != 0 && i < 3) {
        return "upCategory";
    }
    if ((i + 1) % 4 != 0 && i > 3 && i < 7) {
        return "downCategory";
    }
    if (i == 3) {
        return "lastCategory";
    }
}

function selectCategory(e) {
    var cat = $('#categories div');
    $.each(cat, function (i) {
        if (i == $(e).index()) {
            $(this).addClass('activeCategory');
        } else {
            $(this).removeClass('activeCategory');
        }
    })
}
