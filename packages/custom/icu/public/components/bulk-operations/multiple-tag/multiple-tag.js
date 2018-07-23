'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleTag', function () {
        function multipleTagController($scope, MultipleSelectService) {

            $scope.type = 'tag';

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
            controller: multipleTagController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


