
angular.module('mean.icu.ui.ctrlenter', [])
.directive('ctrlenter', function() {
     return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13 && event.ctrlKey === true) {
                scope.$apply(function (){
                    scope.$eval(attrs.ctrlenter);
                });

                event.preventDefault();
            }
        });
    };
});
