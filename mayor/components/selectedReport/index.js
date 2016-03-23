'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
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

        var html = "<h5> Време: #=dateFormat(data.CreatedAt)#</h5><h5>Категория: #=data.Category.Name# </h5><h5>Статус: #=data.Status# </h5><h5>Последователи: #=getFollowers(data) #</h5><h5>Адрес: #=data.Address#</h5><h5>Потребител: #=data.Owner.DisplayName#</h5><h5>Организация:  #=data.Region#</h5><h5> Коментар: #=data.Comment#</h5>";
        var template = kendo.template(html);
        var result = template(report);
        var scroller = $("#reportInfo").data("kendoMobileScroller");
        scroller.scrollElement.html(result);
    },
    afterShow: function () {}
});