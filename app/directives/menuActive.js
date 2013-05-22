var modules = modules || {};

modules['menuActive'] = angular.module( 'menuActive', []).directive('leftMenu', ['$location', function(location) {
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
}]).directive('leftModule', ['$location', function(location, $rootScope) {
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
