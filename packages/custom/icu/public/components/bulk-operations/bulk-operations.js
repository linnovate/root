'use strict';

angular.module('mean.icu.ui.bulkoperations', [])
    .controller("MultipleSelectController", function ($scope, MultipleSelectService) {
        $scope.selectedItems = $scope.$parent.selectedItems;

        $scope.bulkUpdate = function(type){

        };

        $scope.bulkOperationAllowed = function(type){
            MultipleSelectService.haveBulkPerms($scope.selectedItems, type)
        }
        //[{action = XXX, currentlyAllowed = true/false}]
        //getBulkOperationAllowed = function(list of entites,action to be performend)
    });
