'use strict';

angular.module('mean.icu.ui.tabs')
.directive('icuTabsActivities', function(UsersService) {
    function controller($scope) {
        $scope.activity = {};

        $scope.save = function(form) {
            console.log(form);
        };

        UsersService.getMe().then(function (me) {
            $scope.me = me;
        });
    }

    return {
        restrict: 'A',
        scope: {
            activities: '='
        },
        replace: true,
        controller: controller,
        templateUrl: '/icu/components/tabs/activities/activities.html'
    };
});
