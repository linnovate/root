'use strict';

angular.module('mean.icu.ui.avatar', [])
    .directive('icuAvatar', function () {
        return {
            restrict: 'A',
            scope: {
              user: '='
            },
            templateUrl: '/icu/components/avatar/avatar.html'
        };
    });
