	   function utf8_to_b64( str ) {
	     return window.btoa(unescape(encodeURIComponent( str )));
	   };
	   
	   function b64_to_utf8( str ) {
	       return decodeURIComponent(escape(window.atob( str )));
	   };
    
// main.js
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


function fnTransformRequestToForm(data)
{
    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function(obj)
    {
      var query = '';
      var name, value, fullSubName, subValue, innerObj, i;
      
      obj["StandardDate"] = 1; // this tells the service layer to return the correct date format
      
      for(name in obj)
      {
        value = obj[name];
        
        if(value instanceof Array)
        {
          for(i=0; i<value.length; ++i)
          {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value instanceof Object)
        {
          for(subName in value)
          {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value !== undefined && value !== null)
        {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
      }
      
      return query.length ? query.substr(0, query.length - 1) : query;
    };
    
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
};

var app = angular.module('cleoMgr', ['filters','test', 'account', 'catalog', 'order', 'DataTables','ajoslin.promise-tracker','http-auth-interceptor', 'localytics.directives', 'ui.select2','webStorageModule','ngGrid', 'ngResource'], function ($httpProvider)
{
 // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [fnTransformRequestToForm];
  
  
});

// this is our directive
app.directive('serverValidate', [
        function() {
            return {
                link: function(scope, element, attr) {
                    var form = element.inheritedData('$formController');
                    // no need to validate if form doesn't exists
                    if (!form) return;
                    // validation model
                    var validate = attr.serverValidate;
                    // watch validate changes to display validation
                    scope.$watch(validate, function(errors) {

                        // every server validation should reset others
                        // note that this is form level and NOT field level validation
                        form.$serverError = { };

                        // if errors is undefined or null just set invalid to false and return
                        if (!errors) {
                            form.$serverInvalid = false;
                            return;
                        }
                        // set $serverInvalid to true|false
                        form.$serverInvalid = (errors.length > 0);

                        // loop through errors
                        $.each(errors, function(i, error) {                            
                                form.$serverError[error.key] = { $invalid: true, message: error.value };
                        });
                    });
                }
            };
        }
    ]);

app.directive('inputField', function() {
    return {
        //restrict: 'A',
        compile: function(element, attrs)
        {
            var formName = element.parents('form').get(0).name;
            var type = attrs.type || 'text';
            var cssClass = "";
            var placeholder = "";
            
            if (attrs.placeholder)
            {
              placeholder = ' placeholder="' + attrs.placeholder + '"';
            }
            if (attrs.class)
            {
              cssClass = ' class ="' + attrs.class + '" ';
            }
            
            var label = "";
            if (attrs.label)
            {
              label = '<label class="control-label" for="' + attrs.inputField + '">' + attrs.label + '</label>';
            }
            
            var required = attrs.hasOwnProperty('required') ? "required='required'" : "";
            var htmlText = '<div class="control-group">' + label + 
                    '<div class="controls">' +
                    '<input type="' + type + '"' + cssClass + placeholder + 'id="' + attrs.inputField + '"  data-ng-model="' + attrs.ngModel + '" name="' + attrs.inputField + '" ' + required + '>' +
                    '<span data-error-Field="' + attrs.inputField + '" data-form-Name="' + formName + '"></span>' +
                    '</div>' +
                '</div>';
            element.replaceWith(htmlText);
        }
    }
});
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

app.directive('errorField', function() {
    return {
        //restrict: 'A',
        compile: function(element, attrs)
        {
            var formName;
            if (attrs.formName)
            {
              formName = attrs.formName;
            }
            else
            {
              formName = element.parents('form').get(0).name;
            }
            
            var htmlText = '<span class="validation-error" ng:show="' + formName + '.$serverError.' + attrs.errorField + '.$invalid">' +
                    '		{{ ' + formName + '.$serverError.' + attrs.errorField + '.message }}</span>';
            element.replaceWith(htmlText);
        }
    }
});

app.directive('leftMenu', ['$location', function(location) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            var $ul = $(element);

            var $tabs = $ul.children();
            var tabMap = {};
            $tabs.each(function() {
              var $li = $(this);
              if ($li.find("a").attr('href'))
              {
                tabMap[$li.find('a').attr('href').substring(1)] = $li;
              }
            });

            console.log(location.url());
            scope.location = location;
            scope.$watch('location.url()', function(newPath) {
                $tabs.removeClass("active");
                if (tabMap[newPath])
                {
                  tabMap[newPath].addClass("active");
                  console.log("New Path = " + newPath);
                }
                else
                {
                  var found = false;
                  angular.forEach(tabMap, function(value, key){
                    if (newPath.indexOf(key) == 0)
                    {
                      found = true;
                      value.addClass("active");
                    }
                  });
                  
                  if (! found)
                  {
                    //console.log("New Path not found = " + newPath);
                  }
                }
                
            });
        }

    };

 }]);


app.directive('leftModule', ['$location', function(location, $rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $container = $(element);
            
            var $tabs = $container.children();
            var tabMap = {};
            $tabs.each(function() {
              var $li = $(this);
              if ($li.attr('data-url-match'))
              {
                tabMap[$li.attr('data-url-match').substring(1)] = $li;
              }
            });

            scope.location = location;
            scope.$watch('location.path()', function(newPath) {
                $tabs.each(function() {
                  $(this).addClass("inivisible").removeClass("visible").hide();
                });
                
                if (tabMap[newPath])
                {
                  tabMap[newPath].removeClass("invisible").addClass("visible").show();
                  console.log("[Module] New Path = " + newPath);
                }
                else
                {
                  var foundPath = false;
                  
                  for (var k in tabMap)
                  {
                    console.log(newPath.substring(0, k.length) + " vs " + k);
                    if (newPath.substring(0, k.length) == k)
                    {
                      tabMap[k].removeClass("invisible").addClass("visible").show();    
                      console.log("[Module] Fallback Path found = " + k);
                      foundPath = true;
                      break;
                    }
                  }
                  
                  if (foundPath === false)
                  {
                    console.log("[Module] New Path not found = " + newPath);
                  }
                }
                
            });
        }

    };

 }]);
app.value('uiSelect2Config', {allowClear: true});
angular.module('filters', []).
  filter('dateFormat', function ($filter) {
      return function (datetime) {
          return datetime ? $filter('date')(new Date(datetime), 'short') : '';
      
      }
});
        /*
  var Order = $resource('/Service.ashx/Order/:action',
                          { OrderHeaderID: ':id' }, {
                            update: { method: 'PUT' }
                          }
                          );
 
  Order.prototype.update = function(cb) {
    return Order.update({id: this._id.$oid},
      angular.extend({}, this, {_id:undefined}), cb);
  };
 
  Order.prototype.destroy = function(cb) {
    return Order.remove({id: this._id.$oid}, cb);
  };
 
  return Order;*/


var factoryLookup = app.factory('Lookup', function($http, $resource, webStorage) {
  
  function time()
  {
        return +new Date()
  };
  
  return  {
    query: function(params)
    {
      if (! params["service"])
      {
        params.service = 'Lookup';
      }
      
      params.IncludeValidation = false;
      params.IncludeSI = false;
      
      var key = angular.toJson(params);
      var keyhash = "_Lookup_" + CryptoJS.SHA256(key);
      if (webStorage.isSupported)
      {
        var cachedValue = webStorage.get(keyhash);
        if (cachedValue !== null)
        {
          if (_.has(cachedValue, "v") == false || _.has(cachedValue, "e") == false || cachedValue.e < time())
          {
            webStorage.remove(keyhash);
          }
          else
          {
            return {
              success: function(callback)
              {
                callback(cachedValue.v);
              }
            };            
          }

        }
      }
      
      return $http({method:"POST", tracker: 'ServiceCall',
        url: '/Service.ashx/' + params.service + '/' + params.action, 
        data: params}).success(function(data)
        {
            if (webStorage.isSupported && data.success === true)
            {
              webStorage.add(keyhash, {
                v:data,
                e:time() + (6 * 60 * 60 * 1000) // 6 hours
              });
            }
        });
    }
  };
  
  return $resource('/Service.ashx',
                          { tracker: 'ServiceCall' }, {
                            query: { method: 'POST' }
                          }
                          );
});

app.config(['$routeProvider',
	 function($routeProvider)
	 {
	   $routeProvider.when(
	     	"/Home/Dashboard",
		{ templateUrl: 'views/home.html', controller: 'Home' }
	    );
	  
	   $routeProvider.when(
	     	"/login",
		{ templateUrl: 'views/login.html', controller: 'Login' }
	    );
	   	   
	   
	   /*
	   $routeProvider.when(
	     	"/Orders/:ID",
		{ templateUrl: 'views/order.html', controller: 'Order' }
	     );	     */
    
    $routeProvider.when("/Orders/Dashboard", 
                        { templateUrl: 'views/orderDashboard.html', controller: 'OrderDashboard' }

     );
	   
	   $routeProvider.otherwise({redirectTo: '/Home/Dashboard'});	 
    
  
	 }
]);
/*
app.run(function($rootScope){
   $rootScope.$on('$routeChangeSuccess', function(evt, cur, prev) {
    console.log("changed");
    $(document).ready(function() {
      $('.accordion-body').on('show',function(){
           $(this).siblings('.accordion-heading').find('.accordion-toggle')
             .addClass('opened');
          });
      $('.accordion-body').on('hide',function(){
           $(this).siblings('.accordion-heading').find('.accordion-toggle')
             .removeClass('opened');
       });
    });
  });
});
*/
app.run(function($rootScope, $location, $anchorScroll, $routeParams) {
  //when the route is changed scroll to the proper element.
  $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    $location.hash($routeParams.scrollTo);
    $anchorScroll();  
  });
  
  $rootScope.isEmpty = function(str)
  {
      return _.isEmpty(str) || str.length < 1;
  };  
  
  $rootScope.add = function(str1, str2)
  {
    return _.parseInt(str1) + _.parseInt(str2);
  };    
});

app.controller('MyCtrl', function($scope) {

	 $scope.myData = [{name: "Moroni", age: 50},
	   {name: "Tiancum", age: 43},
	   {name: "Jacob", age: 27},
	   {name: "Nephi", age: 29},
	   {name: "Enos", age: 34}];
	   
	   $scope.gridOptions = { data: 'myData' };
	   
});


function LoginCtrl(authService, $scope, $rootScope, $http, $route, $routeParams, $rootScope)
{
  $scope.loading = true;
	 $scope.login = function()
	 {
    if ($scope.processingLogin)
    {
      return false;
    }
        
    $scope.processingLogin = true;
    
    if ($scope.loggedIn)
    {
      return false;
    }

    $http({method:"POST",
      url: '/Service.ashx/Security/login', 
      data: {
        "LimitProperties": "FullName,LastLoginDttm",
        "username": this.username,
        "password": this.password
    }}).success(function(data, status, headers, config) {
        $scope.invalidUsernamePassword = false;
        if (data.success)
        {
          $scope.loginForm = false;
          $scope.loggedIn = true;
          $scope.name = data.Data.FullName;
          $rootScope.username= $scope.name;
          $('#modalLogin').modal('hide');
          authService.loginConfirmed();
        }
        else
        {
          $scope.invalidUsernamePassword = true;
        }
        
        $scope.processingLogin = false;
    }).error(function(data, status, headers, config) {
        $scope.processingLogin = false;
        if (404 === status) {
            $scope.loginForm.$invalid = true;
        }
    });
    return false;	   
	 };
  
  $scope.loginVisible = false;
  $rootScope.$on('event:auth-login:Required', function(){
    if (!$scope.loginVisible)
    {
      $scope.loggedIn = false;
      $scope.loginVisible = true;
      $('#modalLogin').modal('show');
    }
  });
  
  
  $('#modalLogin').on('shown', function () {
    $("#modalLogin input:text, #modalLogin textarea").first().focus();
  });
  
  $('#modalLogin').on('hide', function () {
    if ($scope.loggedIn !== true)
    {
      return false;
    }
    
    $scope.loginVisible = false;
  });
  
  $http({method:"POST", url: '/Service.ashx/Security/CheckToken', data: {}}).success(function(data){
    if (data.success === false)
    {
      $rootScope.$broadcast('event:auth-login:Required');
    }
  });  
};
app.controller('Login', LoginCtrl);

function HomeCtrl($scope, $route, $routeParams)
{
	 
};
app.controller('Home', HomeCtrl);


function LeftNavCtrl($scope, $route, $routeParams)
{
  var defaultMenu = [
  {
    href: 'Orders',
    text: 'Order Search'
  }
    ];
  
    $scope.menu = defaultMenu;    
    
	 $scope.$on( 'ModuleContext.update', function( event, module ) {
    var menu = [];
    console.log("Updated menu with " + module);
    console.log(event);
    switch(module)
    {
      case "Order":
        menu = [
          {
            href: 'Orders',
            text: 'Order Search2'
          }
        ];
        break;
      default: 
        menu = [
          {
            href: 'Orders',
            text: 'Opps!'
          }
        ];
        break;
    };
    $scope.menu = menu;
   });
};
app.controller('LeftNav', LeftNavCtrl);


function OrderDashboardCtrl($scope, $route, $rootScope, $routeParams)
{
 
   $rootScope.$broadcast( 'ModuleContext.update', "Order");
 /*
   $scope.$on( 'MenuService.update', function( event, menu ) {
     $scope.menu = menu;
   });
	 $scope.ID = $routeParams.ID;
  */
};

app.controller('OrderDashboard', OrderDashboardCtrl);


function ServiceStatusCtrl(promiseTracker,$scope)
{
    $scope.serviceCall = promiseTracker('ServiceCall');
};

app.controller('ServiceStatus', ServiceStatusCtrl);
ServiceStatusCtrl.$inject = ['promiseTracker','$scope'];
