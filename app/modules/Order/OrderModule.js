var fn2OrdersCtrl = BaseCtrl.extend({
  defaultView: "search",
  viewPrefix: "search",
  templateBase: "app/modules/Order",
	 constructor: function(Lookup, Order, $scope, $http, $route, $routeParams, $location, $rootScope, $timeout, webStorage)
	 {
	   // initialize the base constructor... this makes magic happen
	   this.base($scope, $rootScope, $route, $routeParams, $location, $timeout, webStorage);
    this.Order = Order;
    this.$scope.params = {pageSize: 10, pageStart: 0};
    
    this.$scope.search = angular.bind(this, function()
    {
      this.saveState('Q', this.$scope.params);
    });
    
    this.initLookups(Lookup);
    
	   // required at the end of the constructor
	   this.processView();
    
    this.$scope.$on("viewParamChange", angular.bind(this, this.processViewParamChange));
    this.$scope.$watch("params.pageSize", angular.bind(this,function(){
        this.$scope.search();
    }));
    this.$scope.$watch("params.pageStart", angular.bind(this,function(){
        this.$scope.search();
    }));    
    
    this.$scope.nextPage = angular.bind(this, function() {
        this.$scope.params.pageStart = _.parseInt(this.$scope.params.pageStart) + _.parseInt(this.$scope.params.pageSize);
    });
    
    this.$scope.prevPage = angular.bind(this, function() {
        this.$scope.params.pageStart = _.parseInt(this.$scope.params.pageStart) - _.parseInt(this.$scope.params.pageSize);
    });    
    
    // this triggers viewParamChange
	   this.computeRouteChanges();
	 },
  processViewParamChange: function(event, chgObj)
  {  
    // ignore changes outside our view
    if (this.isActiveView())
    {
        if(chgObj['Q'] || chgObj.isViewChange)
        {
          this.doSearch();
        }
    }
  },
  initLookups: function(Lookup)
  {
    Lookup.query({action:'StateList',LimitProperties:'StateCd,StateName,CountryCode'}).success(angular.bind(this,function(data){
        this.$scope.statelist = _.filter(data.Data, function(record) { return record.CountryCode.trim() === "US"; });
    }));
    
    Lookup.query({action:'UserList',LimitProperties:'SysUserID,FullName,UserName'}).success(angular.bind(this,function(data){
        this.$scope.replist = data.Data;
    }));
    
    Lookup.query({action:'OrderHeaderStatusList'}).success(angular.bind(this,function(data){
        this.$scope.orderstatuslist = data.Data;
    }));    
    
    Lookup.query({action:'PaymentStatusList'}).success(angular.bind(this,function(data){
        this.$scope.paymentstatuslist = data.Data;
    }));       
    
    Lookup.query({action:'WebsiteList',LimitProperties:'WebsiteID,WebsiteName'}).success(angular.bind(this,function(data){
        this.$scope.websitelist = data.Data;
    }));    
    
    Lookup.query({action:'ProductTypeList'}).success(angular.bind(this,function(data){
        this.$scope.producttypelist = data.Data;
    }));  
    
    Lookup.query({action:'SupplierList',LimitProperties:'SupplierID,SupplierName'}).success(angular.bind(this,function(data){
        this.$scope.supplierlist = data.Data;
    }));      

    Lookup.query({action:'ShipMethodList',LimitProperties:'ShipMethodID,ShipMethodDesc',start:1,limit:100}).success(angular.bind(this,function(data){
        this.$scope.shipmethodlist = data.Data;
    }));       
  },
  doSearch: function()
  {
    return;
    
    if (! this.$routeParams.Q)
    {
      return;
    }
    
    var inputParams = this.getState('Q');
    this.$scope.params = this.$scope.params || {};
    _.assign(this.$scope.params,inputParams);
    
    var searchOptions = _.merge({}, this.$scope.params, 
    {
            action:'Search', 
            LimitProperties:'CreateDttm,OrderHeaderID,BillToName,WebsiteIDDesc,OrderHeaderStatusIDDesc,AccountID,TotalAmt,CreateUserIDDesc',
            start: this.$scope.params.pageStart || 0, 
            limit: this.$scope.params.pageSize || 10
    });
    
    this.Order.query(searchOptions).success(angular.bind(this,function(data) {
        this.$scope.orders = data.Data;       
    }));    
  }
});
	   

var fn2OrderCtrl = BaseCtrl.extend({  
  defaultView: "edit.summary",
  viewPrefix: "edit.",
  templateBase: "app/modules/Order",
	 constructor: function(Account, Order, $scope, $http, $route, $routeParams, $location, $rootScope,$timeout, webStorage)
	 {
	   // initialize the base constructor... this makes magic happen
	   this.base($scope, $rootScope, $route, $routeParams, $location,$timeout, webStorage);
    this.Order = Order;
    this.Account = Account;
    
    this.$scope.order = {};
    this.$scope.$on("viewParamChange", angular.bind(this, this.processViewParamChange));
    this.$scope.$watch("order.OrderHeaderID", angular.bind(this, this.orderChangedEvent), true);

    this.computeRouteChanges();
  },
  viewBindings: function()
  {
      return {
                "edit.billing": this.populateAccountContacts,
                "edit.summary.tabs.comments": this.populateOrderComments
            };
  },
  orderChangedEvent: function()
  {
    if (this.$scope.order.OrderHeaderID)
    {
        this.$scope.$broadcast("OrderChanged")
    }
  },
  processViewParamChange: function(event, chgObj)
  {
    if (this.isActiveView())
    {
        if (chgObj["id"])
        {
         this.doEdit();   
        }
        
        if (chgObj.isViewChange)
        {
            if (this.viewBindings()[this.activeView()])
            {
                angular.bind(this,this.viewBindings()[this.activeView()])();
            }
        }
    }
  },
  populateOrderComments: function()
  {
        this.Order.getComments(this.$scope.order.OrderHeaderID).success(angular.bind(this, function(data){
            this.$scope.OrderComments = data.Data;
        }));  
        
        var orderChangeListener = this.$scope.$on("OrderChanged", angular.bind(this, function(){orderChangeListener(); this.populateOrderComments(); }));
  },
  populateAccountContacts: function()
  {
      this.Account.getContacts({AccountID: this.$scope.order.AccountID, 
          LimitProperties:'FullName,PhoneNo,ContactID,ContactAlias,EmailAddr,CompanyName,Addr1,Addr2,City,StateCd,PostalCd'}).success(
          angular.bind(this, function(data)
          {
              this.$scope.accountContacts = data.Data;
           }));      
      
      // Listen for order changes... then update data
      // note we autoclear the watcher each time... not sure if needed
      var orderChangeListener = this.$scope.$on("OrderChanged", angular.bind(this, function(){orderChangeListener(); this.populateAccountContacts(); }));
  },
  doEdit: function()
  {
      if (this.$routeParams.id)
      {
         this.Order.get(this.$routeParams.id).success(angular.bind(this, function(data){
            this.$scope.order = data.Data;
        }));    

         // eek? why do I need this?
         window.scrollTo(0,0);

      }
  }
});

var modules = modules || {};

modules['order'] = angular.module( 'order', []).config( [ '$routeProvider', function( $routeProvider ) {
    $routeProvider.when(
	     	"/Orders/:action",
		{ templateUrl: 'app/modules/Order/orders.html', controller: 'Orders', reloadOnSearch: false}
	     );    
    
}]).controller('Orders', fn2OrdersCtrl).controller('Order', fn2OrderCtrl);

