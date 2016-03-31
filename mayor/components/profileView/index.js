'use strict';

app.profileView = kendo.observable({
    onShow: function() {
        removeStartReportView();
    },
    afterShow: function() {}
});

// START_CUSTOM_CODE_profileView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_profileView