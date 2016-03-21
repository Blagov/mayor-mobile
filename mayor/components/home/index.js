'use strict';

app.reports = {};

app.home = kendo.observable({
    onShow: function (event) {
        showAroundReports(event)
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                if (e.index == 0) {
                    showAroundReports(event)
                } else {

                }
            },
            index: 0
        });
    },
    afterShow: function () {}
});

function showAroundReports(event) {


    var location = new Geolocation();

    location.getCityInfo(function (lData) {
        var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
        $(".around-reports").height(h);

        var filter = new Everlive.Query();
        filter.where().eq('Region', lData.state);
        var el = app.data.mayorMobile;
        var data = el.data('Problems');
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                    console.log(data)
                    app.reports = data.result;
                    var html =
                        '# for (var i = 0; i < data.length; i++) { #' 
                            + '<div id=#=i# onclick="onSelect(this.id)"  class="item" style="overflow:hidden;position: relative;">' 
                            +	  '<img width="100%" style="position: absolute;" src="#=data[i].Images[0].Url#">' 
                            +     '<div class="profile-image">' 
                            +         '<img src="images/temp/user_profile_img.png" width="50">' 
                            +     '</div>' 
                            +     '<div class="report-date">' 
                            +         '<img src="images/temp/clock-icon-300x300.png" width="14">' 
                            +         '<p style="margin-left: 0.2rem;">' 
                            +             '#=dateFormat(data[i].CreatedAt)#' 
                            +         '</p>' 
                            +     '</div>' 
                            +     '<div class="report-followers">' 
                            +         '<img src="images/temp/gnome_stock_person.png" width="15">' 
                            +         '<p style="margin-left: 0rem;margin-right: 0.2rem;">' 
                            +             '#= getFollowers(data[i].Followers) #' 
                            +         '</p>' 
                            +     '</div>' 
                            +     '<div class="ad-category-info">' 
                            +         '<img src="images/temp/map-marker-256-white.png" width="15" class="marker-report">' 
                            +         '<p style="margin-left: 0rem;margin-right: 0.2rem;">' 
                            +             '#=data[i].Address#'
                            +         '</p>' 
                            +         '<a style="display:inline-block;border-radius:30px;float:right;top:5px;" class="km-widget km-button km-state-active">' 
                            +             '<span class="km-text">#=data[i].Category.Name #</span>' 
                            +         '</a>' 
                            +     '</div>' 
                            + '</div>' 
                    	+ '# } #'


                    var template = kendo.template(html);
                    var result = template(data.result);
                    var scroller = $("#import-reports").data("kendoMobileScroller");
                    scroller.scrollElement.html(result);
                    $(".item").height(h / 1.95);
                },
                function (error) {
                    console.log("err", error);
                });
    })
}

function dateFormat(date) {

    var mshours = 60 * 60 * 1000,
        msDay = 60 * 60 * 24 * 1000,
        msMinutes = 60 * 1000,
        then = new Date(date),
        now = new Date(),
        string = '';

    var days = Math.floor((now - then) / msDay),
        hours = Math.floor(((now - then) % msDay) / mshours),
        minutes = Math.floor(((now - then) % msDay) / msMinutes);
    if (days > 0) {
        days == 1 ? string += days + " ден," : string += days + " дни,";
    }
    if (mshours > 0) {
        hours == 1 ? string += hours + " час" : string += hours + " часа";
    }
    if (minutes > 0 && minutes < 60) {
        minutes == 1 ? string = minutes + " минута" : string = minutes + " минути";
    }
    if (days == 0 && hours == 0 && minutes == 0) {
        var seconds = Math.floor((now - then) / 1000);
        seconds == 1 ? string = seconds + " секунда" :  string = seconds + " секунди";
    }

    return string;
}

function getFollowers(followers){
    return followers.length;
}

function onSelect(i) {
    console.log(app.reports[i]);
}