'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
        removeStartReportView();
        var id = event.view.params.id;
        var report = app.reports[id];
        var items = {
            data: report.Images,
            pageSize: 0
        };
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#selectedReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        scrollView.refresh();
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
            }
            changeStatusView(data.result.IsAdmin);
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
    var report = app.reports[params.id];
    var el = app.data.mayorMobile;
    var data = el.data('Followers');
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
    var report = app.reports[params.id];
    var data = el.data('Followers');
    var id = $("#follow a").data("id");
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
    	var report = app.reports[params.id];
        var html = '<select onchange="changeStatus()">';
        problemStatus.forEach(function(el, i){
            if(report.Status == i){
                 html += '<option value="'+ i +'" selected>'+ el +'</option>';
            }else{
                 html += '<option value="'+ i +'">'+ el +'</option>';
            }
           
        });
        html += '</select>';
        $('#changeStatus').html(html);
    }
}
function changeStatus(){
    $(".spinner").show();
    var i = $('#changeStatus select').val();
    var el = app.data.mayorMobile;
    var params = getUrlParams(window.location.href);
    var report = app.reports[params.id];
    var data = el.data('Problems');
    data.updateSingle({ Id: report.Id, 'Status': i },
    function(data){
        $(".spinner").hide();
    },
    function(error){
        console.log(error);
    });
}
