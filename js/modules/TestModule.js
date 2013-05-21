/*function Base(A){}
Base.$inject = ['A'];

function _Child(B){}
Child.$inject = ['B'];

var Child = extend(Base, _Child);

function extend(base, child){

  // new joint constructor.
  function C(){
    base.apply(this, arguments.splice(0, Base.$inject.length));
    child.apply(this, arguments.splice(Base.$inject.length));
  };

  function Inherit(){};
  Inherit.prototype = base.prototype;

  C.prototype = new Inherit(); // instantiate it without calling constructor

  // ask for everything.
  C.$inject = [].concat(base.$inject).concat(child.$inject); 
  return C;*/
	 

// Note: The array based syntax will work if minification is performed on the code... debatable if needed


/*
function fnTestCtrl(ViewProvider, ViewHandler, Lookup, $scope, $http, $route, $routeParams, $location, $anchorScroll,$rootScope)
{
	     console.log("View handler scope");
	     console.log(ViewHandler.scope);
	     console.log("View handler scope end");
	     console.log("View provider scope");
	     console.log(ViewProvider.scope);
	     console.log("View provider scope end");	     
	  // ViewHandler.initialize($scope, $routeParams, $rootScope, $location);
ViewHandler = ViewHandler($scope);
	     console.log(ViewHandler);
	     
	   ViewProvider.initialize($scope, $routeParams, $rootScope, $location);
	   
	   $scope.view = {};
	   var cname = $route.current.controller;
	   var lastView = "";
	   
	   $scope.switchView = function(newView)
	   {
	     $location.search('v', newView);
	     if (arguments.length > 1)
	     {
	       var key = "";
	       for (var i = 1, len = arguments.length; i < len; i++)
	       {
		 if (i % 2 == 0)
		 {
		   $location.search(key, arguments[i]);
		 }
		 else
		 {
		   key = arguments[i];
		 }
	       }
	       
	     };
	   };
	   
	   function saveState(code, objState)
	   {
	     $location.search(code, utf8_to_b64(angular.toJson(objState)));
	   };
	   
	   function getState(code)
	   {
	     if (! $routeParams[code])
	     {
	       return {};
	     }
	     
	     return angular.fromJson(b64_to_utf8($routeParams[code]));
	   };
	   
	   function processView()
	   {
	     var newView = $routeParams.v;
	     angular.forEach($scope.view, function(value, key)
	     {
	       if (_.isUndefined(newView) || newView.indexOf(key) !== 0)
	       {
		 $scope.view[key] = false;
	       }
	     });
	     
	     if (newView && newView.length > 0)
	     {
	       var view = newView.split(".");
	       var lastRef = $scope.view;
	       
	       $scope.view.root = view[0];
	       
	       for (var i = 0, len = view.length; i < len; i++)
	       {
		 lastRef = lastRef[view[i]] = {};
	       }
	       
	       $scope.$broadcast("viewChange", $routeParams.v);
	       lastRef = null;
	     }
	     else
	     {
	       $scope.view.root = "";
	       $scope.view.default = {};
	     }

	     lastView = $routeParams.v;
	   };
	   
	   $rootScope.$on('$routeUpdate', function(event,routeInfo) {
	     if (lastView == routeInfo.params.v || routeInfo.controller !== cname)
	     {
	       return;
	     }
	     processView();
    });
	   
	   processView();
};
*/

var fn2TestCtrl = BaseCtrl.extend({
	 constructor: function(Lookup, $scope, $http, $route, $routeParams, $location, $anchorScroll, $rootScope)
	 {
	   // initialize the base constructor... this makes magic happen
	   this.base($scope, $rootScope, $route, $routeParams, $location);
	   
	   // required at the end of the constructor
	   this.processView();
	 }
});
	   
var testModule = angular.module( 'test', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Test/",
		{ templateUrl: 'views/test.html', controller: 'Test', reloadOnSearch: false}
	     );
}]).controller('Test', fn2TestCtrl);

