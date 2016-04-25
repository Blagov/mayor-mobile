'use strict';
var el = app.data.mayorMobile;

app.profileView = kendo.observable({
    onShow: function() {
        removeStartReportView();
    },
    afterShow: function() {}
});

// START_CUSTOM_CODE_profileView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
function logout() {
    User.logout(function(err){
        console.log('logout');
        if(err == null){
            app.mobileApp.navigate('components/home/view.html');
        }else{
            console.log(err);
        }
    });
}
// END_CUSTOM_CODE_profileView