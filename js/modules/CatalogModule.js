var fn2CatalogCtrl = BaseCtrl.extend({
	 constructor: function(Lookup, $scope, $http, $route, $routeParams, $location, $anchorScroll, $rootScope, $injector)
	 {
	   // initialize the base constructor... this makes magic happen
	   this.base($scope, $rootScope, $route, $routeParams, $location);
	   
	   // required at the end of the constructor
	   this.processView();
	 }
});

var catalogModule = angular.module( 'catalog', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Catalog/:action",
		{ templateUrl: 'views/catalog.html', controller: 'Catalog', reloadOnSearch: false}
	     );    
    
}]).controller('Catalog', function() {});
