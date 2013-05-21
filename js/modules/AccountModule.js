var accountModule = angular.module( 'account', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Accounts/:action",
		{ templateUrl: 'views/accounts.html', controller: 'Accounts', reloadOnSearch: false}
	     );    
    
}]).controller('Accounts', function() {});
