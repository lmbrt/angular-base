var modules = modules || {};

modules['mockData'] = angular.module( 'mockData', []);

var factories = {
    orderFactory: modules['mockData'].factory('Order', function($http) {
      return  {
          query: function(params)
          {
              params.IncludeValidation = false;
              params.IncludeSI = false;
              return $http({method:"POST", tracker: 'ServiceCall',
                  url: '/Service.ashx/Order/' + params.action, 
                  data: params});
          },
          get: function(id)
          {
              return $http({method:"POST", tracker: 'ServiceCall',
                  url: '/Service.ashx/Order/Fetch', 
                  data: {OrderHeaderID: id }});        
          },
          getComments: function(id)
          {
              return $http({method:"POST", tracker: 'ServiceCall',
                  url: '/Service.ashx/Order/FetchOrderComments', 
                  data: {OrderHeaderID: id }});  
          }
      };
    }),
    accountFactory: modules['mockData'].factory('Account', function($http) {
      return  {
          getContacts: function(params)
          {
              params.IncludeValidation = false;
              params.IncludeSI = false;
              
              return $http({method:"POST", tracker: 'ServiceCall',
                  url: '/Service.ashx/Account/ContactList', 
                  data: params});
          },
          get: function(id)
          {
              return $http({method:"POST", tracker: 'ServiceCall',
                  url: '/Service.ashx/Account/Fetch', 
                  data: {AccountID: id }});        
          }
      };
    }),
    LookupFactory: modules['mockData'].factory('Lookup', function($http, $resource, webStorage) {
          
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
              
              var url = '/app/data/' + params.service + '/' + params.action + ".json";
              url = url.toLowerCase();
              return $http({method:"GET", tracker: 'ServiceCall',
                url: url}).success(function(data)
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
        })
};

