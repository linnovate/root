'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsVersions', function () {
        return {
            restrict: 'A',
            scope: {
                versions: '='
            },
            replace: true,
            templateUrl: '/icu/components/tabs/versions/versions.html'
        };
    });
