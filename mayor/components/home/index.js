'use strict';
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
                    "Images.Problem": {
                        "ReturnAs" : "Images",
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
              var html = 
                  '# for (var i = 0; i < data.length; i++) { #'
                    +'<div class="kor" style="overflow:hidden;position: relative;">'
                           +'<img width="100%" style="position: absolute;" src="#=data[i].Images[0].Url#">'
                           +'<div class="profile-image">'
                               +'<img src="images/temp/user_profile_img.png" width="50">'
                           +'</div>'
                           +'<div class="report-date">'
                               +'<img src="images/temp/clock-icon-300x300.png" width="14">'
                               +'<p style="margin-left: 0.2rem;">'
                                   +'2 дни, 12 часа'
                               +'</p>'
                           +'</div>'
                           +'<div class="report-followers">'
                               +'<img src="images/temp/gnome_stock_person.png" width="15">'
                               +'<p style="margin-left: 0rem;margin-right: 0.2rem;">'
                                   +'8'
                               +'</p>'
                           +'</div>'
                           +'<div class="ad-category-info">'
                               +'<img src="images/temp/map-marker-256-white.png" width="15" class="marker-report">'
                               +'<p style="margin-left: 0rem;margin-right: 0.2rem;">'
                                   +'бул, Тодор Александров, 30'
                               +'</p>'
                                +'<a style="display:inline-block;border-radius:30px;width:80px;float:right;top:5px;" class="km-widget km-button km-state-active">'
                                +'<span class="km-text">дупка</span>'
                              +'</a>'
                           +'</div>'
                       +'</div>'
                    +'# } #'
  

                    var template = kendo.template(html);
                    var result = template(data.result);
            		var scroller = $("#import-reports").data("kendoMobileScroller");
            		scroller.scrollElement.html(result);
                	$(".kor").height(h / 1.95);
                },
                function (error) {
                    console.log("err", error);
                });
    })
}

// START_CUSTOM_CODE_home 
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home