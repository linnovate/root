'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDelete', function () {
        function multipleDeleteController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'delete';
            $scope.selectedItems = $scope.$parent.selectedItems;

            refreshAllowed();
            $scope.$on('refreshList', function (event) {
              refreshAllowed();
            });

            function refreshAllowed(){
              return $scope.allowed = MultipleSelectService.haveBulkPerms($scope.type);
            }
        }
        return {
            controller: multipleDeleteController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


