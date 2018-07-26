'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleAssign', function () {
        function multipleAssignController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'assign';
            $scope.tooltipTitle = 'bulkAssignee';
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
            controller: multipleAssignController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


