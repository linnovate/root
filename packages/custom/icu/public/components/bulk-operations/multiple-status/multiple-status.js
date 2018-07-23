'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleStatus', function () {
        function multipleStatusController($scope, MultipleSelectService) {

            $scope.type = 'status';

            $scope.selectedItems = $scope.$parent.selectedItems;
            refreshAllowed();

            $scope.$on('refreshList', function (event) {
              refreshAllowed();
            });

            NotifyingService.subscribe('refreshSelectedList', function () {
              refreshAllowed();
            }, $scope);

            function refreshAllowed(){
              return $scope.allowed = MultipleSelectService.haveBulkPerms($scope.type);
            }
        }
        return {
            controller: multipleStatusController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


