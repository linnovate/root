'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsDocuments', function () {
        function controller($scope) {
            // Should be deleted when server will work correct
            $scope.documents[0].versions = [_.clone($scope.documents[0]), _.clone($scope.documents[0])];
            $scope.documents[1].versions = [_.clone($scope.documents[1]), _.clone($scope.documents[1])];

            $scope.isOpen = {};
            $scope.trigger = function (document) {
                $scope.isOpen[document._id] = !$scope.isOpen[document._id];
            };
        }

        return {
            restrict: 'A',
            scope: {
                documents: '='
            },
            replace: true,
            controller: controller,
            templateUrl: '/icu/components/tabs/documents/documents.html'
        };
    });
