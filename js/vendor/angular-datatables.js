/*
 * An angular JS module for datatables. 
 */
angular
    .module('DataTables', [])
    .directive('datatables', function($timeout) {
    
    return {
        require: '?ngModel',
        link: function(scope, element, attrs,ngModel) {
        
        $.extend( $.fn.dataTableExt.oStdClasses, {
            "sWrapper": "dataTables_wrapper form-inline"
        } );
                    
        // apply DataTable options, use defaults if none specified by user
        var options = {};
        if (attrs.datatables.length > 0) {
            options = scope.$eval(attrs.datatables);
        } else {
            options = {
               /* "bStateSave": true, */
                "iCookieDuration": 2419200,
                "bFilter": false,
                "bInfo": false,
                "bPaginate": false, /* 1 month */
              /*  "bJQueryUI": false,
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": false,
                "bInfo": false,
                "bDestroy": true,*/
                "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>"

            };
        }

        // Tell the dataTables plugin what columns to use
        // We can either derive them from the dom, or use setup from the controller           
        var explicitColumns = [];
        element.find('th').each(function(index, elem) {
            if ($(elem).attr("mData"))
            {
                explicitColumns.push({mData: $(elem).attr("mData")});
            }
            else if (! $(elem).attr("nobinding"))
            {
                explicitColumns.push($(elem).text());    
            }
            
        });
        if (explicitColumns.length > 0) {
            options["aoColumns"] = explicitColumns;
        } else if (attrs.aoColumns) {
            options["aoColumns"] = scope.$eval(attrs.aoColumns);
        }

        // aoColumnDefs is dataTables way of providing fine control over column config
        if (attrs.aoColumnDefs) {
            options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
        }
        
        if (attrs.fnRowCallback) {
            options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
        }


        
        var dataTable = null;

        $timeout(function() {
            // apply the plugin
            dataTable = element.dataTable(options);
            if (ngModel)
            {
                if (ngModel.$viewValue)
                {
                    dataTable.fnAddData(ngModel.$viewValue);    
                }
            }
            
            return dataTable;
          }); 
        
        
        
        if (ngModel)
          {
            ngModel.$render = function() {
                if (! dataTable)
                {
                    $timeout(function() {
                        ngModel.$render();
                    }, 10);
                    return;
                }
                
                dataTable.fnClearTable();
                if (ngModel.$viewValue)
                {
                dataTable.fnAddData(ngModel.$viewValue);
                }
            };
          }
        
       
        
      }
   };
});
