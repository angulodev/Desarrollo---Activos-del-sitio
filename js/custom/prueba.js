var clientId = "1246e001-ddfa-450e-b068-a018c81ec66b";
var clientSecret = 'RVLxchgmp1WRFjjP7h2.9q95_xvY.JmB8_';
var callback = 'https://grupoentel.sharepoint.com/sites/RRHH/desa/SitePages/test.aspx';
// var uuid = mainapp.uuid();
var resource = 'https://grupoentel.sharepoint.com/';
var authServer = 'https://login.microsoftonline.com/common/oauth2/authorize?';
var Sitio = 'https://grupoentel.sharepoint.com/sites/RRHH/desa/';
var URLToken = 'https://login.microsoftonline.com/common/oauth2/token';
var SignOut = 'https://grupoentel.sharepoint.com/sites/RRHH/desa/_layouts/SignOut.aspx';
var logout = 'https://login.microsoftonline.com/common/oauth2/logout';
var Loading = "https://grupoentel.sharepoint.com/sites/RRHH/desa/SitePages/test.aspx";



var $mail='folave@entel.cl'

var ref = window.open(authServer + 'response_type=code&login_hint=' + $mail + '&client_id=' + clientId + '&redirect_uri=' + callback + '&resource=https://grupoentel.sharepoint.com/sites/RRHH/desa/', '_blank', 'location=no,clearsessioncache=no,clearcache=no');

console.log(ref);

ref.addEventListener('loadstart', function (event) {
try {
    var url = event.url.toString();
    if (url.startsWith(callback)) {
        var Cancel = url.indexOf('cancel');
        if (Cancel !== -1) {
            $ionicPopup.alert({
            title: 'Informaci&#243;n',
            template: 'Ud ha cancelado su inicio de session.',
            okText: 'OK'
            });
        }
        else {
            setTimeout(function () {
            $scope.perfil();
            $scope.Token = "login";
            $rootScope.token = "login";
            localStorage.setItem("token", "login");
            $rootScope.$broadcast('HabilitaMenu');
            $location.path("/home");
            ref.close();
            }, 20000);
        }
    }
} catch (e) {
alert(e.message);
}
});