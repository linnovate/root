'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDelete', function () {
        function multipleDeleteController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'delete';
            $scope.selectedItems = $scope.$parent.selectedItems;

            refreshAccess();
            $scope.$on('refreshBulkButtonsAccess', function (event) {
                refreshAccess();
            });

            function refreshAccess(){
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


