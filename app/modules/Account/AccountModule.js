var modules = modules || {};

modules['account'] = angular.module( 'account', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Accounts/:action",
		{ templateUrl: 'app/modules/Account/accounts.html', controller: 'Accounts', reloadOnSearch: false}
	     );    
    
}]).controller('Accounts', function() {});
