'use strict';

angular.module('mean.icu.ui.bulkoperations', [])
    .directive('multipleSelect', function () {
        function controller($scope, MultipleSelectService) {

            $scope.bulkUpdate = function(type){
                MultipleSelectService.haveBulkPerms($scope.selectedItems, type);
            };

            $scope.checkCornerState = function(){
                if(MultipleSelectService.getCornerState() === 'none'){
                    $scope.$emit('disableMultipleMode')
                }
            }

        }
        return {
            templateUrl: '/icu/components/bulk-operations/bulk-operations.html',
            restrict: 'E',
            scope: {
                selectedItems: '=',
                cornerState: '=',
            },
            controller: controller
        };
    });
