angular.module('mean.icu.ui.autofocus', [])
.directive('autofocus', function() {
    function link($scope, $element, attrs) {
        if (!attrs.autofocus && attrs.autofocus !== '') {
            return;
        }

        $element[0].focus();
        $scope.onEnter = function($event) {
            if ($event.keyCode === 13) {
                $event.preventDefault();

                $element.parent().find('.text')[0].focus();
            }
        };
    }

    return {
        restrict: 'A',
        link: link
    };
});
