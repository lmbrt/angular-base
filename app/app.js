
var modules = modules || {};
var thirdPartyModules = ['DataTables','ajoslin.promise-tracker','http-auth-interceptor', 'localytics.directives', 
                         'ui.select2','webStorageModule','ngGrid', 'ngResource','ui.bootstrap.accordion'];
var moduleLoadList = [];

angular.forEach(modules, function(value, key){
  moduleLoadList.push(key);
});

var app = angular.module('appName', moduleLoadList.concat(thirdPartyModules), function ($httpProvider)
{
  
});

app.constat("authFailurePropertyName", "AuthFailure");
/*
app.directive('tooltip', function () {
    return {
        restrict:'A',
        link: function(scope, element, attrs)
        {
            $(element)
                .attr('title',scope.$eval(attrs.tooltip))
                .tooltip({placement: "right"});
        }
    }
});*/

app.value('uiSelect2Config', {allowClear: true});

app.config(['$routeProvider',
	 function($routeProvider)
	 {
	   $routeProvider.when(
	     	"/Home/Dashboard",
		{ templateUrl: 'views/home.html', controller: 'Home' }
	    );
	  
	   $routeProvider.otherwise({redirectTo: '/Home/Dashboard'});	 
	 }
]);

app.run(function($rootScope) {
 
  $rootScope.isEmpty = function(str)
  {
      return _.isEmpty(str) || str.length < 1;
  };  
  
  $rootScope.add = function(str1, str2)
  {
    return _.parseInt(str1) + _.parseInt(str2);
  };    
  
  angular.element(document).ready(function () {
    //
    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };  
    var target = document.getElementById('loadingSpinner');
    var spinner = new Spinner(opts).spin(target);
  });  
});


function HomeCtrl($scope, $route, $routeParams)
{
	 
};
app.controller('Home', HomeCtrl);


function ServiceStatusCtrl(promiseTracker,$scope)
{
    $scope.serviceCall = promiseTracker('ServiceCall');
};

app.controller('ServiceStatus', ServiceStatusCtrl);
ServiceStatusCtrl.$inject = ['promiseTracker','$scope'];
