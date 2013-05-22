var modules = modules || {};

modules['httpRequestTransform'] = angular.module( 'httpRequestTransform', []).config( [ '$httpProvider', function( $httpProvider ) {
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
  
 // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [fnTransformRequestToForm];
  
}]);
