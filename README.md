angular-base
==============

Angular Base Project

Goal is to provide a base project for large systems built on angular.  

# Components
  * Isolated modules
  * Authentication Services that intercept login-expired events and replay 
requests after successful logins
  * Sub-view routing
  * Base Controller Class

# Isolated modules

angular-base is designed for pluggable modules to self-initialize and 
self-register with angular's routing engine. Each module initializes itself when 
it is loaded by registering with a global modules array. 

 ### Example
 
  var modules = modules || {};
  modules['order'] = angular.module( 'order', []).config( [ '$routeProvider', function( $routeProvider ) {
      $routeProvider.when(
		  "/Orders/:action",
		  { templateUrl: 'app/modules/order/orders.html', controller: 'Orders', reloadOnSearch: false}
	      );    
      
  }]).controller('Orders', fnOrdersCtrl).controller('Order', fnOrderCtrl);


