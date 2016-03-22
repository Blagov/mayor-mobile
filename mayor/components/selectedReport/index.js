'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
        var id = event.view.params.id;
        var report = app.reports[id];
        console.log(report);
        var items = {
            data: report.Images,
            pageSize: 0
        };
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#selectedReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        scrollView.refresh();
    },
    afterShow: function () {}
});