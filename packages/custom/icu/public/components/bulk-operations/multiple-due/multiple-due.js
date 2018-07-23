'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDue', function () {
        function multipleDueController($scope, MultipleSelectService) {

            $scope.type = 'due';

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
            controller: multipleDueController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


