var modules = modules || {};

modules['login'] = angular.module( 'login', []).config(['$routeProvider', function($routeProvider)
 {
	   $routeProvider.when(
	     	"/login",
		{ templateUrl: 'views/login.html', controller: 'Login' }
	    );
 }]).run( [ '$http', function( $http ) {
 /* angular.element(document).ready(function() {
    $http({method:"POST", url: '/Service.ashx/Security/CheckToken', data: {}}).success(function(data){
      if (data.success === false)
      {
        $rootScope.$broadcast('event:auth-login:Required');
      }
    });
  });
    */
}]).controller('Login', function (authService, $scope, $rootScope, $http, $route, $routeParams, $rootScope)
  {
  $scope.loading = true;
	 $scope.login = function()
	 {
    if ($scope.processingLogin)
    {
      return false;
    }
        
    $scope.processingLogin = true;
    
    if ($scope.loggedIn)
    {
      return false;
    }

    $http({method:"POST",
      url: '/Service.ashx/Security/login', 
      data: {
        "LimitProperties": "FullName,LastLoginDttm",
        "username": this.username,
        "password": this.password
    }}).success(function(data, status, headers, config) {
        $scope.invalidUsernamePassword = false;
        if (data.success)
        {
          $scope.loginForm = false;
          $scope.loggedIn = true;
          $scope.name = data.Data.FullName;
          $rootScope.username= $scope.name;
          $('#modalLogin').modal('hide');
          authService.loginConfirmed();
        }
        else
        {
          $scope.invalidUsernamePassword = true;
        }
        
        $scope.processingLogin = false;
    }).error(function(data, status, headers, config) {
        $scope.processingLogin = false;
        if (404 === status) {
            $scope.loginForm.$invalid = true;
        }
    });
    return false;	   
	 };
  
  $scope.loginVisible = false;
  $rootScope.$on('event:auth-login:Required', function(){
    if (!$scope.loginVisible)
    {
      $scope.loggedIn = false;
      $scope.loginVisible = true;
      $('#modalLogin').modal('show');
    }
  });
  
  
  $('#modalLogin').on('shown', function () {
    $("#modalLogin input:text, #modalLogin textarea").first().focus();
  });
  
  $('#modalLogin').on('hide', function () {
    if ($scope.loggedIn !== true)
    {
      return false;
    }
    
    $scope.loginVisible = false;
  });
});
