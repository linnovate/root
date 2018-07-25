'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDue', function () {
        function multipleDueController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'due';
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
            controller: multipleDueController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


