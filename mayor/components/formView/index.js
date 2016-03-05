'use strict';

app.formView = kendo.observable({
    onShow: function () {},
    afterShow: function () {},
});

// START_CUSTOM_CODE_formView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

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