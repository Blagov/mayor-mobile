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
    el.Users.logout().then(function () {
        	_user.login = null;
        	app.mobileApp.navigate('components/home/view.html');
        }, // success
        function () {
            alert('Failed logout');
        });  
}
// END_CUSTOM_CODE_profileView