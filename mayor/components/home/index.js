'use strict';
app.home = kendo.observable({
    onShow: function (event) {
        $("#reports").kendoMobileButtonGroup({
            select: function (e) {
                console.log("selected index:" + e.index);
            },
            index: 0
        });
        var h = event.view.content[0].clientHeight-$("#reports").height()-10;
        $(".around-reports").height(h);
        $(".kor").height(h/1.8);
        
    },
    afterShow: function () {}
});

// START_CUSTOM_CODE_home 
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home