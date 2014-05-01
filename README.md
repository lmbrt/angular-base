angular-base
==============

Angular Base Project

Goal is to provide a base project for large systems built on angular.  

# Running the example

Start a local webserver and point it at the root directory.  Open your browser to the app.html

In the example, only order search and edit order are functional, but both demonstrate the majority of the features.  Note that the order factory only returns one dataset so you'll constantly see the same data.

# Components
  * [Isolated modules]
  * Authentication Services that intercept login-expired events and replay 
requests after successful logins
  * Sub-view routing
  * Base Controller Class

# (Isolated modules)

angular-base is designed for pluggable modules to self-initialize and 
self-register with angular's routing engine. Each module initializes itself when 
it is loaded by registering with a global modules array.  

### Structure

All modules are contained in the app/modules/ directory. The goal with this modal
was to keep all views and controllers isolated in the associate directory to make maintaining 50-100 independent modules simple.


### Example

```
	var modules = modules || {};
	modules['order'] = angular.module( 'order', []).config( [ '$routeProvider', function( $routeProvider ) {
	$routeProvider.when(
		  "/Orders/:action",
		  { templateUrl: 'app/modules/order/orders.html', controller: 'Orders', reloadOnSearch: false}
	      );    
	
	}]).controller('Orders', fnOrdersCtrl).controller('Order', fnOrderCtrl);
```

