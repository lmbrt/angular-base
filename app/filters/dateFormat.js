var modules = modules || {};

modules['filters'] = angular.module('filters', []).
  filter('dateFormat', function ($filter) {
      return function (datetime) {
          return datetime ? $filter('date')(new Date(datetime), 'short') : '';
      
      }
});
