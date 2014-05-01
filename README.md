angular-base
==============

Angular Base Project

Goal is to provide a base project for large systems built on angular.  This code is based on AngularJS 1.04.	

# Running the example

Start a local webserver and point it at the root directory.  Open your browser to the app.html

In the example, only order search and edit order are functional, but both demonstrate the majority of the features.  Note that the order factory only returns one dataset so you'll constantly see the same data.

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

### Structure

All modules are contained in the app/modules/ directory. The goal with this modal
was to keep all views and controllers isolated in the associate directory to make maintaining 50-100 independent modules simple.  Each module has a primary controller and view file.


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

# Authentication Services

http-auth-interceptor.js was original written by Witold Szczerba.  angular-base modifies this implementation by adding broadcast events so that any module can handle authentication management. As implemented, the login module listens for event:auth-login:Required and displays #modalLogin until a succesful login is achieved. 

All requests made while waiting for login are queued and replayed once login is successful.  This allows for factories to populate lists transparently while login is occuring.

# Sub-view routing

AngularJS comes with a basic routing tool that allows one view to be driven by a controller to be active at any time.  Part of the challenge in implementing a large application is the need for deep nested views within an application.  In the example app, clicking on Orders will activate the OrderSearch controller.

When in OrderSearch, executing a search and clicking edit will activate the edit sub-view that is tied to the Order controller.   This controller is nested within the OrderSearch controller and is essentially a child controller.

### Structure 

The basic page structure for this setup is:

```
<div class="row">
	<div class="span12">	 
		 <div data-ng-switch data-on="view.root" >
		 	<div data-ng-switch-when="search">
			  	<div data-ng-include="'app/modules/order/orderSearch.html'"></div>
			</div>
		 	<div data-ng-switch-when="edit">
		    		<div ng-include="'app/modules/order/order.html'" ng-controller="Order"> </div>
			</div>
		 	<span ng-switch-default>Missing view</span>
		 </div>
	</div>
</div>
```

view.root controls which view is shown at any point in time.  The OrderSearch controller has search configuration parameters one of which is the defaultView.  The defaultView is activated when the controller is initialized.

Each alternate sub-view is contained in an ng-switch-when block.  The sub-view can be defined inline or within another file.  It can also specify a seperate controller that will be initialized when the view is activated and serves as a slave to the parent controller.

### Nested views

Deep nested views are supported as well.  In the order example, you will find something similar to this:

```
	  <div ng-show="view.edit.summary">
	  ...
	  </div>
	  <div ng-show="view.edit.billing">
	  ...
	  </div>
```

Both of these are tied to the edit sub-view and can be activated.  Note that the activation is recursive.  First the edit sub-view is intialized and then the summary/billing sub-sub-view is initialized.  There is no reason another level of controllers couldn't be utilized here either.

*Note:* All sub-views within a controller should have the same prefix.  In the example above, both summary and billing must be under the view.edit. sub-view.  

### Implementation

The basis for implementing sub-views is based on angular's routeParams and the ability to disable reloadOnSearch in the routeProvider.  Basically, a query string parameter drives the activate view.  To switch views, the query string is updated and the controller listens to the $routeUpdate event. Because switching views is driven by changing the URL, all 
activation always occurs the same way.  This means that all URLs can be sent / pasted and the exact view will be shown.

# Base Controller Class

Sub-view routing carries quite a bit of crude code.  To handle all sub-view routing, a base controller is provided in the BaseCtrl.js file. 

### Configuration

 * **viewKey:** Query string parameter used to drive sub-views
 * **defaultView:** Sub-view to be initialized when none are specified
 * **viewPrefix:** Prefix of the sub-view

### Methods

 * **isActiveView():** Determines if the controller is the owner of the current active sub-view
 * **processView():** Processes *viewKey* to determine current active sub-view.  If *viewKey* is not present, *defaultView* will be initialized.
 * **switchView(view):** Switches active view to specified view.
 * **saveState(key,obj):**  Serializes an object to the specified query string key. Useful for keeping view state in browser history.
 * **getstate(key):** Deserializes an object from the specified query string.  Returns empty object if key not present.

### Events

 * **viewParamChange:** Fires when a view has been changed. function(event, chgObj);  chgObj contains all properties that changed in the routeParams since the last view change. chgObj.isViewChange is a bool indicating if a sub-view was changed.  If false, then only query string parameters changed and can be accessed on chgObj.
 * **viewChanging:**  Fires immediately before a view is changed. function(event, activeView, newView);
 * **viewChange:** Fires immediately after a view is changed. function(event, newView);
 * **I_AM_MASTER:**  Fires in response to "findMaster" broadcast. Only sent from top-level controller. function(event, instanceOfTopLevelController);

### Listeners

 * **findMaster:**  The top-level controller will response to this broadcast with a reference to itself.

### Basic Controller File

```
var modules = modules || {};

var fnAccountController = BaseCtrl.extend({
  defaultView: "search",
  viewPrefix: "account",
  templateBase: "app/modules/Account",
  constructor: function($scope, $http, $route, $routeParams, $location, $rootScope, $timeout, webStorage)
  {
    // initialize the base constructor... this makes magic happen
    this.base($scope, $rootScope, $route, $routeParams, $location, $timeout, webStorage);

    // required at the end of the constructor
    this.processView();
    
    this.$scope.$on("viewParamChange", angular.bind(this, this.processViewParamChange));
    
    
    // this triggers viewParamChange
    this.computeRouteChanges();
  },
  // Each time the view is changed, this function is fired
  processViewParamChange: function(event, chgObj)
  {  
    // ignore changes outside our view
    if (this.isActiveView())
    {
       // do something
        if (chgObj.isViewChange)
        {
            if (this.viewBindings()[this.activeView()])
            {
                angular.bind(this,this.viewBindings()[this.activeView()])();
            }
        }      
    }
  },
  // Functions fired when certain subviews are activated
  viewBindings: function()
  {
      return {
                "search": this.doSomethingWhenSearchIsActivated,
                "edit.contacts": this.doSomethingWhenEditContactsIsActivated
            };
  },
  doSomethingWhenSearchIsActivated: function(){},
  doSomethingWhenEditContactsIsActivated: function(){}		
});

modules['account'] = angular.module( 'account', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Accounts/:action",
		{ templateUrl: 'app/modules/account/accounts.html', controller: 'Accounts', reloadOnSearch: false}
	     );    
    
}]).controller('Accounts', fnAccountController);
```
