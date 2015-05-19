'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope) {
    }

    return {
        restrict: 'A',
        scope: {
            projects: '=',
            discussions: '=',
            people: '='
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller
    };
});
