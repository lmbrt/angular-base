var BaseCtrl = Base.extend({
	 constructor: function($scope, $rootScope, $route, $routeParams, $location, $timeout, webStorage){
	   this.$scope = $scope;
	   this.$rootScope = $rootScope;
	   this.$location = $location;
	   this.$routeParams = $routeParams;
	   this.$route = $route;
	   this.$timeout = $timeout;
	   this.webStorage = webStorage;
	   
	   if (this.$scope[this.scopeKey()])
	   {
	     this.activeViewCtrl = false;
	   }
	   else
	   {
	     this.$scope[this.scopeKey()] = {};
	     this.activeViewCtrl = true;
	     this.$scope.view = {};
	     this.$rootScope.$on('$routeUpdate', angular.bind(this, this.fnRouteUpdate));
	   }
	   
	   // record our controller name for future ref
	   this.controllerName = this.$route.current.$route.controller;
	   
	   // bind events and functions
	   this.$scope.switchView = angular.bind(this, this.switchView);
	   
	   this.$scope.$on("FindMaster", angular.bind(this, function() { 
	     this.$scope.$broadcast("IAMYOURFATHER", this);
	   }));
	 },
	 lastView: "",
	 viewKey: "v",
	 defaultView: "",
	 viewPrefix: null,
	 isActiveView: function()
  {
	   if (this.viewPrefix == null)
	   {
	     return false;
	   }
	   
	   return this.activeView().indexOf(this.viewPrefix, 0) === 0;
  },
	 computeRouteChanges: function()
	 {
	   var chgObj = {};
	   if (! this.lastRoute)
	   {
	     this.lastRoute = {};
	   }
	   
	   angular.forEach(this.$routeParams, angular.bind(this, function(value, key)
	   {
	     if (this.lastRoute[key] !== value)
	     {
	       chgObj[key] = true;
	     }
	   }));
	   
	   if (chgObj[this.viewKey])
	   {
	     chgObj.isViewChange = true;
	   }
	   
	   this.updateLastRoute();
	   this.$scope.$broadcast("viewParamChange", chgObj);
	 },
	 updateLastRoute: function()
	 {
	   this.lastRoute = {};
	   angular.copy(this.$routeParams, this.lastRoute);
	 },
	 scopeKey: function()
	 {
	   return "_viewCtrl" + this.viewKey;
	 },
	 activeView: function()
	 {
	   return this.$scope[this.scopeKey()].currentview;
	 },
	 fnRouteUpdate: function(event, routeInfo)
	 {
	   // don't bother if the view hasn't changed
	   // or if the route does not belong to our controller
	   if (this.lastView == routeInfo.params[this.viewKey] || routeInfo.controller !== this.controllerName)
	   {
	     // do nothing
	   }
	   else
	   {
	 
	     this.processView();	   
	   }
	   
	   this.computeRouteChanges();
	 },
	 processView: function()
	 {
	     var newView = this.$routeParams[this.viewKey];
	     angular.forEach(this.$scope.view, angular.bind(this, function(value, key)
	     {
	       if (angular.isUndefined(newView) || newView.indexOf(key) !== 0)
	       {
		 this.$scope.view[key] = false;
	       }
	     }));
	     
	     if (newView && newView.length > 0)
	     {
	       this.$scope.$broadcast("viewChanging", this.activeView(), newView);
	       var top = window.pageYOffset || document.documentElement.scrollTop;
	       if (top < 1)
	       {
		 top = null;
	       }

	       // interesting take on Y scroll pos... not sure what I think?
	       var positionState = null;
	       if (this.viewKey && this.activeView())
	       {
		 positionState = this.webStorage.get("_pos" + this.viewKey) || {};
		 positionState['p' + this.activeView()] = top;
		 this.webStorage.add("_pos" + this.viewKey, positionState);
	       }
	        
	       var view = newView.split(".");
	       var lastRef = this.$scope.view;
	       
	       this.$scope.view.root = view[0];
	       
	       for (var i = 0, len = view.length; i < len; i++)
	       {
		 lastRef = lastRef[view[i]] = {};
	       }
	       
	       lastRef = null;
	       
	       this.$scope.$broadcast("viewChange", newView);
	       
	       if (positionState && positionState['p' + newView])
	       {
		 var yPos = _.parseInt(positionState['p' + newView]);
		 if (yPos > 0)
		 {
		   this.$timeout(function() {
		     window.scroll(0, yPos);
		   }, 150, false);
		 }
	       }
	     }
	     else
	     {
	       this.$scope.view.root = "";
	       this.$scope.view.default = {};
	     }

	     this.$scope[this.scopeKey()].currentview = this.lastView = newView || "";
	     
	     if (this.activeView().length < 1)
	     {
	       if (this.defaultView && this.defaultView.length > 0)
	       {
		 this.switchView(this.defaultView);
	       }
	     }
	 },
	 switchView: function(newView)
	 {
	     this.$location.search(this.viewKey, newView);
	     
	     if (arguments.length < 3)
	     {
	       return;
	     }
	     
	     // allow overloading of the function 
	     // to append more to query string
	     var key = "";
	     for (var i = 1, len = arguments.length; i < len; i++)
	     {
	       if (i % 2 == 0)
	       {
		 if (angular.isObject(arguments[i]))
		 {
		   this.saveState(key, arguments[i]);
		 }
		 else
		 {
		   this.$location.search(key, arguments[i]);
		 }
	       }
	       else
	       {
		 key = arguments[i];
	       }
	     }
	 },
	 saveState: function(code, objState)
	 {
	   var newObjState = _.omit(objState, function(value) {
          if (_.isString(value))
          {
              return _.isEmpty(value);
          }
          
          return  _.isNaN(value) || _.isNull(value) || _.isUndefined(value);
	   });
	   
	   this.$location.search(code, utf8_to_b64(lzw_encode(angular.toJson(newObjState))));
	 },
	 getState: function(code)
	 {
	   if (! this.$routeParams[code])
	   {
	     return {};
	   }
	   
	   return angular.fromJson(lzw_decode(b64_to_utf8(this.$routeParams[code])));	   
	 }
});
