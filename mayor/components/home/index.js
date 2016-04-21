'use strict';

app.home = kendo.observable({
    onShow: function (event) {
        $(".spinner").show();
        removeStartReportView();
        var scroller = $("#import-reports").data("kendoMobileScroller");
        showAroundReports(event, scroller);
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                scrollBool = true;
                if (e.index == 0) {
                    switchView = 0;
                    showAroundReports(event, scroller)
                } else if(e.index == 1){
                    switchView = 1;
                    showLastReports(event, scroller)
                }
            },
            index: 0
        });
        var buttongroup = $("#reports").data("kendoMobileButtonGroup");
        buttongroup.select(switchView);
    }
});

function showAroundReports(event, scroller) {
    if(reports.arround.length == 0){
        var l = new Geolocation();
        l.getCityInfo(function (lData) {
           user.location = lData;
           getData(function(err){
                if(err == null){
                    initializeReportView(event, scroller);
                }else{
                    console.log(err);
                }
            });    
        })
    }else{
        updateView(event, scroller);
    }
}

function showLastReports(event, scroller) {
   if(reports.last.length == 0){
       getData(function(err){
        if(err == null){
            initializeReportView(event, scroller);
        }else{
            console.log(err);
        }
   	   });   
   }else{
       updateView(event, scroller);
   }  
}

function onSelect(i) {
    app.mobileApp.navigate('components/selectedReport/view.html?id=' + i);
}

function initializeReportView(event, scroller){
    var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
    var html = reportView(0);
    var template = kendo.template(html);
    var result;
    if(switchView==0){
        result = template(reports.arround);
    }else if(switchView==1){
        result = template(reports.last);
    }
    $("#import-reports").height(h);
    scroller.scrollElement.html(result);
    $(".item").height(h / 1.955555);
    scroller.bind("scroll", function(e) {
    	if(e.scrollTop + e.sender.scrollElement.context.clientHeight == e.sender.scrollElement.context.scrollHeight && scrollBool) {
            scrollBool = false;
       		appendItems(event, scroller)
        }
  	});
    scroller.scrollTo(0, 0);
    $(".spinner").hide();
}

function reportView(items){
    var s = '';
    var height = screen.width;
    var img = 'https://bs1.cdn.telerik.com/image/v1/33yxnxr2hb8476xc/resize=w:'+height+'/';
     if(switchView==0){
        s = '#=data[i-' + Number(items) + '].Address#';
    }else{
        s = '#=data[i-' + Number(items) + '].Address#, #=data[i-' + Number(items) + '].Region#';
    }
    var html =
    '# for (var i=' + Number(items) + '; i < data.length +' + Number(items)  + '; i++) { #' 
        + '<div id=#=i# onclick="onSelect(this.id)"  class="item" style="overflow:hidden;position: relative;">' 
        +	  '<img width="100%" style="position: absolute;" src='+img+'#=data[i-' + Number(items) + '].Images[0].Url#>' 
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

function getData(cb){
    var filter = new Everlive.Query();
    var el = app.data.mayorMobile;
    var data = el.data('Problems');
    if(switchView==0){
        filter.skip(reports.arround.length).take(5).orderDesc('CreatedAt').where().eq('Region', user.location.state);
    }else if(switchView==1){
        filter.skip(reports.last.length).take(5).orderDesc('CreatedAt');
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
        		if(switchView == 0){
                    reports.arround = reports.arround.concat(data.result);
                }else if(switchView == 1){
                    reports.last = reports.last.concat(data.result);
                }
                cb(null);
            },
            function (error) {
                cb(error, null);
            });
}

function appendItems(event, scroller){
    var s = $('.item').length;
    var count;
    if(switchView == 0){
        count = reports.arround.length;
    }else if(switchView == 1){
        count = reports.last.length;
    }
    if(count >=  s){ 
        $(".spinner").show();
        getData(function(err){
			if(err == null){
                var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
                var html = reportView(s);
                var template = kendo.template(html);
                var result;
                if(switchView == 0){
                     result = template(reports.arround);
                }else if(switchView == 1){
                    result = template(reports.last);
                }
                scroller.scrollElement.html(result);
                $("#import-reports").height(h);
                $(".item").height(h / 1.955555);
                $(".spinner").hide();
                scrollBool = true;
            }else{
                console.log(err);
            }                        
        });
    }
}

function updateView(event, scroller){
    var date;
    if(switchView==0){
        date = reports.arround[reports.arround.length - 1].CreatedAt;
    }else if(switchView==1){
		date = reports.last[reports.last.length - 1].CreatedAt;
    }
    updateData(date, function(err){
        if(err == null){
            initializeReportView(event, scroller);
            console.log('suc');
        }else{
            if(err.code == 618){
               if(switchView==0){
                   reports.arround = [];
                   showAroundReports(event, scroller)
                }else if(switchView==1){
                    reports.last = [];
                    showLastReports(event, scroller)
                }
            }
            console.log(err);
        }
    });
}
                    
function updateData(date, cb){
    var filter = new Everlive.Query();
    var el = app.data.mayorMobile;
    var data = el.data('Problems');
    if(switchView==0){
        filter.skip(0).take(reports.arround.length).orderDesc('CreatedAt').where().and().gte('CreatedAt', date).eq('Region', user.location.state);
    }else if(switchView==1){
        filter.skip(0).take(reports.last.length).orderDesc('CreatedAt').where().gte('CreatedAt', date);
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
        	console.log(data);
            if(switchView == 0){
                reports.arround = data.result;
            }else if(switchView == 1){
                reports.last = data.result;
            }
            cb(null);
         },
         function (error) {
            cb(error);
         });
}