'use strict';
var el = new Everlive('ic4u9vd726cmn1ot');

var el = new Everlive({
    appId: "ic4u9vd726cmn1ot",
    scheme: "https",
    authentication: {
            persist: true
    }
});

app.formView = kendo.observable({
    onShow: function () {
        checkLogin();
    },
    afterShow: function () {}
});

// START_CUSTOM_CODE_formView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
function checkLogin() {
el.Users.currentUser(function(data) {
    if (data.result) {
        var username = data.result.DisplayName;
        alert(username + " is logged in!");
    } else {
         setTimeout(function() {
         	app.mobileApp.navigate('components/authenticationView/view.html');
         }, 0);    
    }
}, function(err) {
    alert(err.message + " Please log in.");
});
}
// END_CUSTOM_CODE_formView
(function (parent) {
    var formViewModel = kendo.observable({
        fields: {},
        submit: function () {},
        cancel: function () {},
        takePhoto: function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
            });
        }
    });

parent.set('formViewModel', formViewModel);
})(app.formView);

    function onPhotoDataSuccess(imageData) {
      // Uncomment to view the base64 encoded image data
      // console.log(imageData);

      // Get image handle
      //
      var smallImage = document.getElementById('smallImage');

      // Unhide image elements
      //
      smallImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      smallImage.src = "data:image/jpeg;base64," + imageData;
    }

function onFail(message) {
    alert('Failed because: ' + message);
}
