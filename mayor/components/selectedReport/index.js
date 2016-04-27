'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
		//alert(JSON.stringify(User.getUserLocation()));
        removeStartReportView();
        var id = event.view.params.id;
        var report;
        if(switchView == 0){
            report = reports.arround[id];
        }else if(switchView == 1){
            report = reports.last[id];
        }
        var items = {
            data: report.Images,
            pageSize: 0
        };
        var height = screen.width;
   		items.data[0].Url = 'https://bs1.cdn.telerik.com/image/v1/ipekt42qegjbv8hx/resize=w:'+height+'/'+items.data[0].Url;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#selectedReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        
        var html = "<div class=\"info-row\"><label>Докладвано преди</label> #=dateFormat(data.CreatedAt)#</div><div class=\"info-row\"><label>Докладвано от</label>#=data.Owner.DisplayName#</div><div class=\"info-row\"><label>Отговорен орган</label>#=data.Region#</div><div class=\"info-row comment-info\"><label>Коментар</label><div class=\"comment-txt\">#=data.Comment#</div></div>";

        var reportAddress = "<h2>#=data.Address#</h2>";
        $("#reportAddress").html(reportAddress);
        //#=data[i].Images[0].Url
        
        var htmlfollowers ="<div><span class=\"km-icon km-icon-follower\"></span>#=getFollowers(data) #</div>";
        var htmltop = "<h5>Категория: #=data.Category.Name# </h5><h5>Статус: #=status(data.Status)# </h5>";
        
        var template = kendo.template(html);
        var result = template(report);
        var scroller = $("#reportInfo").data("kendoMobileScroller");
        scroller.scrollElement.html(result);

        var el = app.data.mayorMobile;
        el.Users.withHeaders({
            'X-Everlive-Expand': {
                "Followers.Owner": {
                    "ReturnAs": "FollowedProblems",
                    "Fields": {
                        "Problem": 1
                    }
                }
            }
        }).currentUser(function (data) {
            if (data.result != null) {
                var bool = false;
                var id = '';
                if (data.result.FollowedProblems != null) {
                    data.result.FollowedProblems.forEach(function (item) {
                        if (item.Problem == report.Id) {
                            id = item.Id;
                            bool = true;
                            return false;
                        } else {
                            bool = false;
                        }
                    })
                }
                renderFollowerButton(bool, id);
                changeStatusView(data.result.IsAdmin);
            }
        }, function (err) {
            console.log(err.message + " Please log in.");
        });
    },
    afterShow: function () {},
});

function renderFollowerButton(bool, id) {
    if (bool) {
        $('#follow').html('<a class=\"button\" data-id="' + id + '" onclick="unFollow();">Не искам да следя този проблем</a>');
    } else {
        $('#follow').html('<a class=\"button\" onclick="follow();">Това е проблем и за мен</a>');
    }
}

function follow() {
    $(".spinner").show();
    var params = getUrlParams(window.location.href);
    var el = app.data.mayorMobile;
    var data = el.data('Followers');
    var report;
    if(switchView == 0){
        report = reports.arround[params.id];
    }else if(switchView == 1){
        report = reports.last[params.id];
    }
    
    data.create({
            'Problem': report.Id
        },
        function (data) {
            $('#follow').html('<a class=\"button\" data-id="' + data.result.Id + '" onclick="unFollow();">Не искам да следя този проблем</a>');
        	$(".spinner").hide();
        },
        function (error) {
            console.log(error);
        });
}
function unFollow() {
    $(".spinner").show();
    var params = getUrlParams(window.location.href);
    var data = el.data('Followers');
    var id = $("#follow a").data("id");
    var report;
    if(switchView == 0){
        report = reports.arround[params.id];
    }else if(switchView == 1){
        report = reports.last[params.id];
    }
    data.destroySingle({
            'Id': id 
        },
        function () {
            $('#follow').html('<a class=\"button\" onclick="follow();">Това е проблем и за мен</a>');
        	$(".spinner").hide();
        },
        function (error) {
            console.log(error);
        });
}
function status(s){
    return problemStatus[s];
}
function changeStatusView(b){
    if(b){
         var params = getUrlParams(window.location.href);
         var html = '<select onchange="changeStatus()">';
         var report;
         if(switchView == 0){
             report = reports.arround[params.id];
         }else if(switchView == 1){
             report = reports.last[params.id];
         }
        problemStatus.forEach(function(el, i){
            if(report.Status == i){
                 html += '<option value="'+ i +'" selected>'+ el +'</option>';
            }else{
                 html += '<option value="'+ i +'">'+ el +'</option>';
            }
           
        });
        html += '</select>';
        $('#ts-changeStatus').html(html);
    }
}
function changeStatus(){
    $(".spinner").show();
    var i = $('#ts-changeStatus select').val();
    var el = app.data.mayorMobile;
    var params = getUrlParams(window.location.href);
    var report;
    if(switchView == 0){
        report = reports.arround[params.id];
    }else if(switchView == 1){
        report = reports.last[params.id];
    }
    //report.Status = i;
    var data = el.data('Problems');
    data.updateSingle({ Id: report.Id, 'Status': i },
    function(data){
        //alert(JSON.stringify(data));
        $(".spinner").hide();
    },
    function(error){
        //alert(JSON.stringify(error));
        console.log(error);
    });
}