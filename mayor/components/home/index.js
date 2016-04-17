'use strict';
var problemStatus = ["В процес на одобрение", "В процес на работа", "Завършен"];
var switchView = 0;
var scrollBool = true;
var count, loc;
app.reports = {};

app.home = kendo.observable({
    onShow: function (event) {
        removeStartReportView();
        count = 0;
        $(".spinner").hide();
        var scroller = $("#import-reports").data("kendoMobileScroller");
        showAroundReports(event, scroller)
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                count = 0;
                scrollBool = true;
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
       loc = lData;
       getData(function(err, data){
            if(err == null){
                initializeReportView(event, scroller, data);
            }else{
                console.log(err);
            }
        }, 0, lData)    
    })
}

function showLastReports(event, scroller) {
   getData(function(err, data){
        if(err == null){
            initializeReportView(event, scroller, data);
        }else{
            console.log(err);
        }
    }, 0)     
}

function onSelect(i) {
    app.mobileApp.navigate('components/selectedReport/view.html?id=' + i);
}

function initializeReportView(event, scroller, data){
    var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
    var html = reportView(0);
    var template = kendo.template(html);
    var result = template(data.result);
    $("#import-reports").height(h);
    app.reports = data.result;
    scroller.scrollElement.html(result);
    $(".item").height(h / 1.955555);
    scroller.bind("scroll", function(e) {
    	if(e.scrollTop + e.sender.scrollElement.context.clientHeight == e.sender.scrollElement.context.scrollHeight && scrollBool) {
            scrollBool = false;
       		appendItems(event, scroller)
        }
  	});
    scroller.scrollTo(0, 0);
}

function reportView(items){
    var s = '';
     if(switchView==0){
        s = '#=data[i-' + Number(items) + '].Address#';
    }else{
        s = '#=data[i-' + Number(items) + '].Address#, #=data[i-' + Number(items) + '].Region#';
    }
    var html =
    '# for (var i=' + Number(items) + '; i < data.length +' + Number(items)  + '; i++) { #' 
        + '<div id=#=i# onclick="onSelect(this.id)"  class="item" style="overflow:hidden;position: relative;">' 
        +	  '<img width="100%" style="position: absolute;" src="#=data[i-' + Number(items) + '].Images[0].Url#">' 
        +     '<div class="profile-image">' 
        +         '<img src="images/temp/user_profile_img.png" width="50">' 
        +     '</div>' 
        +     '<div class="report-date">' 
        +         '<img src="images/temp/clock-icon-300x300.png" width="14">' 
        +         '<p style="margin-left: 0.2rem;">' 
        +             '#=dateFormat(data[i-' + Number(items) + '].CreatedAt)#' 
        +         '</p>' 
        +     '</div>' 
        +     '<div class="report-followers">' 
        +         '<img src="images/temp/gnome_stock_person.png" width="15">' 
        +         '<p style="margin-left: 0rem;margin-right: 0.2rem;">' 
        +             '#= getFollowers(data[i-' + Number(items) + ']) #' 
        +         '</p>' 
        +     '</div>' 
        +     '<div class="ad-category-info">' 
        +         '<img src="images/temp/map-marker-256-white.png" width="15" class="marker-report">' 
        +         '<p style="margin-left: 0rem;margin-right: 0.2rem;font-size:12px;">' 
    	+ s
        +         '</p>' 
        +         '<a style="display:inline-block;border-radius:30px;float:right;top:5px;" class="km-widget km-button km-state-active">' 
        +             '<span class="km-text">&num;#=data[i-' + Number(items) + '].Category.Name #</span>' 
        +         '</a>' 
        +     '</div>' 
        + '</div>' 
    + '# } #'
    return html;
}

function getData(cb, s, lData){ 
    var filter = new Everlive.Query();
    var el = app.data.mayorMobile;
    var data = el.data('Problems');
    if(switchView==0){
        filter.skip(s).take(5).orderDesc('CreatedAt').where().eq('Region', lData.state);
    }else{
        filter.skip(s).take(5).orderDesc('CreatedAt');
    }

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
        		count = data.count;
                cb(null, data);
            },
            function (error) {
                cb(error, null);
            });
}

function appendItems(event, scroller){
    var s = $('.item').length;
    if(count >  s){ 
        $(".spinner").show();
        getData(function(err, data, loc){
			if(err == null){
                var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
                var html = reportView(s);
                var template = kendo.template(html);
                var result = template(data.result);
                scroller.scrollElement.append(result);
                $("#import-reports").height(h);
                $(".item").height(h / 1.955555);
                Array.prototype.push.apply(app.reports, data.result);
                $(".spinner").hide();
                scrollBool = true;
            }else{
                console.log(err);
            }                        
        }, s, loc);
    }
}