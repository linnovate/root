'use strict';

angular.module('mean.icu.ui.bulkoperations', [])
    .directive('multipleSelect', function () {
        function controller($scope, $state, context, MultipleSelectService) {

            $scope.bulkUpdate = function(type){
                MultipleSelectService.haveBulkPerms($scope.selectedItems, type);
            };

            $scope.entityType = context.main;

            $scope.showForCurrentEntity = function(operation){
                return MultipleSelectService.showButton(operation, $scope.entityType);
            };
        }
        return {
            templateUrl: '/icu/components/bulk-operations/bulk-operations.html',
            restrict: 'E',
            scope: {
                selectedItems: '=',
                cornerState: '=',
                cursorEnterMultiple: '='
            },
            controller: controller
        };
    });
