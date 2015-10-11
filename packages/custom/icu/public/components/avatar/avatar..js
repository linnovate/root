'use strict';

angular.module('mean.icu.ui.avatar', [])
    .directive('icuAvatar', function () {

        function controller($scope) {
            $scope.imgUrl = '?' + Date.now();

        }

        return {
            restrict: 'A',
            scope: {
              user: '='
            },
            templateUrl: '/icu/components/avatar/avatar.html',
            controller: controller
        };
    });
