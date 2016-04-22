'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
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
   		items.data[0].Url = 'https://bs1.cdn.telerik.com/image/v1/33yxnxr2hb8476xc/resize=w:'+height+'/'+items.data[0].Url;
        
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#selectedReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        var html = "<h5> Време: #=dateFormat(data.CreatedAt)#</h5><h5>Категория: #=data.Category.Name# </h5><h5>Статус: #=status(data.Status)# </h5><h5>Последователи: #=getFollowers(data) #</h5><h5>Адрес: #=data.Address#</h5><h5>Потребител: #=data.Owner.DisplayName#</h5><h5>Организация:  #=data.Region#</h5><h5> Коментар: #=data.Comment#</h5>";
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
            console.log(data);
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
        $('#follow').html('<a data-id="' + id + '" onclick="unFollow();">UnFollow</a>');
    } else {
        $('#follow').html('<a onclick="follow();">Follow</a>');

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
            $('#follow').html('<a data-id="' + data.result.Id + '" onclick="unFollow();">UnFollow</a>');
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
            $('#follow').html('<a onclick="follow();">Follow</a>');
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