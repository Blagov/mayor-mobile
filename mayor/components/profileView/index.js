'use strict';

app.profileView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_profileView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
function logout() {
    el.Users.logout().then(function() {
            app.mobileApp.navigate('components/home/view.html');
        }, // success
        function() {
            alert('Failed logout');
        });
}
// END_CUSTOM_CODE_profileView