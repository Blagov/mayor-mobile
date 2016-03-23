'use strict';

var switchView = 0;

app.reports = {};

app.home = kendo.observable({
    onShow: function (event) {
        var scroller = $("#import-reports").data("kendoMobileScroller");
        showAroundReports(event, scroller)
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                if (e.index == 0) {
                    showAroundReports(event, scroller)
                    switchView = e.index;
                } else {
                    switchView = e.index;
                    showLastReports(event, scroller)
                }
            },
            index: 0
        });
    },
    afterShow: function () {}
});

function showAroundReports(event, scroller) {
    var location = new Geolocation();
    location.getCityInfo(function (lData) {
        var filter = new Everlive.Query();
        filter.orderDesc('CreatedAt').where().eq('Region', lData.state);
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
                    initializeReportView(event, scroller, data);
                },
                function (error) {
                    console.log("err", error);
                });
    })
}

function showLastReports(event, scroller) {
    var filter = new Everlive.Query();
    filter.orderDesc('CreatedAt');
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
         	initializeReportView(event, scroller, data);
        },
        function (error) {
            console.log("err", error);
        });
}

function onSelect(i) {
    app.mobileApp.navigate('components/selectedReport/view.html?id=' + i);
}

function initializeReportView(event, scroller, data){
    var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
    var html = reportView();
    var template = kendo.template(html);
    var result = template(data.result);
    $("#import-reports").height(h);
    app.reports = data.result;
    scroller.scrollElement.html(result);
    $(".item").height(h / 1.955555);
}

function reportView(){
    var s = '';
     if(switchView==0){
        s = '#=data[i].Address#';
    }else{
        s = '#=data[i].Address#, #=data[i].Region#';
    }
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
        +             '#= getFollowers(data[i]) #' 
        +         '</p>' 
        +     '</div>' 
        +     '<div class="ad-category-info">' 
        +         '<img src="images/temp/map-marker-256-white.png" width="15" class="marker-report">' 
        +         '<p style="margin-left: 0rem;margin-right: 0.2rem;">' 
    	+ s
        +         '</p>' 
        +         '<a style="display:inline-block;border-radius:30px;float:right;top:5px;" class="km-widget km-button km-state-active">' 
        +             '<span class="km-text">#=data[i].Category.Name #</span>' 
        +         '</a>' 
        +     '</div>' 
        + '</div>' 
    + '# } #'
    return html;
}