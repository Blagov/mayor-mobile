'use strict';
app.home = kendo.observable({
    onShow: function () {
        var template = kendo.template("<div id='box'>#= firstName #</div>");
        var data = {
            firstName: "Todd"
        }; 
        var result = template(data);
        $("#example").html(result); 
    },
    afterShow: function () {}
});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home