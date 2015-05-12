'use strict';

angular.module('mean.icu.ui.tabs')
.directive('icuTabsActivities', function() {
    function controller($scope) {
        $scope.activity = {};

        $scope.save = function(form) {
            console.log(form);
        };
    }

    return {
        restrict: 'A',
        scope: {
            activities: '='
        },
        replace: true,
        controller: controller,
        templateUrl: 'icu/components/tabs/activities/activities.html'
    };
});
