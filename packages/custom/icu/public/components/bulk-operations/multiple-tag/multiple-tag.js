'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleTag', function () {
        function multipleTagController($scope, MultipleSelectService, NotifyingService) {
            $scope.type = 'tag';
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
            controller: multipleTagController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


