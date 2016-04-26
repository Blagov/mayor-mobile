'use strict';
var el = app.data.mayorMobile;

app.profileView = kendo.observable({
    onShow: function() {
        removeStartReportView();
        User.getFollowedProblems(function(err, problems){
            if(err == null){
                var counter = 0;
                problems.forEach(function(problem){
                    var fdate = problem.ModifiedAt;
                    var pdate = problem.Problem.ModifiedAt;
                    if(pdate.getTime() > fdate.getTime()){
                        counter++;
                    }
                });
                var html = "<p>You have " + counter + " changed problems</p>";
                $('#changed-reports').html(html);
            }else{
                console.log(err);
            }
        });
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