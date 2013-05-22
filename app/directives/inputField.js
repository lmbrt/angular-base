var modules = modules || {};

modules['inputField'] = angular.module( 'inputField', []).directive('serverValidate', [
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
]).directive('inputField', function() {
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
}).directive('errorField', function() {
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
