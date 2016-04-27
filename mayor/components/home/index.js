'use strict';

app.home = kendo.observable({
    onShow: function (event) {
        // var el = new Everlive('ju62wz48onyx8zei');
        // var data = el.data('Followers');
        // data.updateSingle({ Id: '89e1a2f0-0af5-11e6-9c65-c38c2b5ab509'},
        //     function(data){
        //         alert(JSON.stringify(data));
        //     },
        //     function(error){
        //         alert(JSON.stringify(error));
        // });
        $(".spinner").show();
        removeStartReportView();
        var scroller = $("#import-reports").data("kendoMobileScroller");
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                $(".spinner").show();
                scrollBool = true;
                if (e.index == 0 && fastSelect) {
                    fastSelect = false;
                    switchView = 0;
                    showAroundReports(event, scroller)
                } else if(e.index == 1 && fastSelect){
                    fastSelect = false;
                    switchView = 1;
                    showLastReports(event, scroller)
                }
            },
            index: 0
        });
        var buttongroup = $("#reports").data("kendoMobileButtonGroup");
        buttongroup.select(switchView);
        var user = User.getUser();
        if(user == null){
            User.login(function(err){
                showAroundReports(event, scroller);
                if(err == null){
                   // console.log();
                }else{
                   console.log(err);
                }
        	});
        }else{
            if (switchView == 0) {
                showAroundReports(event, scroller)
            } else if(switchView == 1){
                showLastReports(event, scroller)
            }
        }
    }
});



function showAroundReports(event, scroller) {
    if(reports.arround.length == 0){
       getData(function(err){
            if(err == null){
                initializeReportView(event, scroller);
            }else{
                 $(".spinner").hide();
                console.log(err);
            }
        });    
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
            $(".spinner").hide();
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
   		var eqh = $("#import-reports").data("kendoMobileScroller").scrollHeight()
        if(e.scrollTop + e.sender.scrollElement.context.clientHeight == eqh && scrollBool) {
            scrollBool = false;
       		appendItems(event, scroller)
        }
  	});
    scroller.scrollTo(0, 0);
    $(".spinner").hide();
    fastSelect = true;
}

function reportView(items){
    var s = '';
    var height = screen.width;
    var img = 'https://bs1.cdn.telerik.com/image/v1/ju62wz48onyx8zei/resize=w:'+height+'/';
     if(switchView==0){
        s = '#=data[i].Address#';
    }else{
        s = '#=data[i].Address#, #=data[i].Region#';
    }
    var html =
    '# for (var i=' + Number(items) + '; i < data.length; i++) { #' 
        + '<div id=#=i# onclick="onSelect(this.id)"  class="listview-item item" >' 
        +	  '<img class="item-img" src='+img+'#=data[i].Images[0].Url#>' 
        +     '<div class="profile-image">' 
        +         '<img src="images/temp/user_profile_img.png">' 
        +     '</div>' 
    		+ '<div class="box-top-right">'
		    + 	'<div class="report-date">' 
    		+ 		'<span class="km-icon km-icon-clock"></span>' 
    		+ 		'#= getFollowers(data[i]) #' 
    		+ 	'</div>' 
    		+ 	'<div class="report-followers">' 
    		+ 		'<span class="km-icon km-icon-follower"></span>' 
    		+ 		'#= getFollowers(data[i]) #' 
    		+ 	'</div>'
    		+ '</div>' 
    		+ '<div class="ad-category-info">' 
    		+ 	'<div class="address">'
    		+ 		'<span class="km-icon km-icon-pinmap"></span>' 
    	    + 		s
        	+ 	'</div>' 
    		+ 	'<div class="category">'
    		+ 		'<a class="km-widget km-button">' 
    		+ 			'<span class="km-text km-icon km-icon-#=data[i].Category.IconName #"><!--&num;#=data[i].Category.Name #--></span>' 
    		+ 		'</a>'
    		+ 	'</div>'
    		+ '</div>'
   		+ '</div>'
    + '# } #'
    return html;
	
}

function getData(cb){
    var filter = new Everlive.Query();
    var el = app.data.mayorMobile;
    var data = el.data('Problems');
    if(switchView==0){
    	var loc = User.getUserLocation();
        filter.skip(reports.arround.length).take(5).orderDesc('CreatedAt').where().eq('Region', loc.state);
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
        		if(data.result.length > 0){
                    if(switchView == 0){
                        reports.arround = reports.arround.concat(data.result);
                    }else if(switchView == 1){
                        reports.last = reports.last.concat(data.result);
                    }
                    cb(null, data.result.length);
                }else{
                    cb("No results", null);
                }
            },
            function (error) {
                cb(error, null);
            });
}

function appendItems(event, scroller){
    var reps;
    if(switchView == 0){
         reps = reports.arround;
    }else if(switchView == 1){
         reps = reports.last;
    }
    if(reps.length >= 5){
        $(".spinner").show();
        getData(function(err, count){
            if(err == null){
                var h = event.view.content[0].clientHeight - $("#reports").height() - 10;
                var html;
                var template;
                var result;
                if(switchView == 0){
                     html = reportView(reports.arround.length-count);
                     template = kendo.template(html);
                     result = template(reports.arround);
                }else if(switchView == 1){
                     html = reportView(reports.last.length-count);
                     template = kendo.template(html);
                     result = template(reports.last);
                }
                scroller.scrollElement.append(result);
                $("#import-reports").height(h);
                $(".item").height(h / 1.955555);
                $(".spinner").hide();
                scrollBool = true;
            }else{
                console.log(err);
                $(".spinner").hide();
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
        var loc = User.getUserLocation();
        filter.skip(0).take(reports.arround.length+1).orderDesc('CreatedAt').where().and().gte('CreatedAt', date).eq('Region', loc.state);
    }else if(switchView==1){
        filter.skip(0).take(reports.last.length+1).orderDesc('CreatedAt').where().gte('CreatedAt', date);
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