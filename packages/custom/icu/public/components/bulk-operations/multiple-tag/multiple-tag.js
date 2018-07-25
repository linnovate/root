'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleTag', function () {
        function multipleTagController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'tag';
            $scope.selectedItems = $scope.$parent.selectedItems;

            refreshAllowed();
            $scope.$on('refreshSelectedList', function (event) {
              refreshAllowed();
            });

            function refreshAllowed(){
              return $scope.allowed = MultipleSelectService.haveBulkPerms($scope.type);
            }
        }
        return {
            controller: multipleTagController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


