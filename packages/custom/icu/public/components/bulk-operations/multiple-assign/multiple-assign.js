'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleAssign', function () {
        function multipleAssignController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'assign';
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
            controller: multipleAssignController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


