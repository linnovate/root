'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleStatus', function () {
        function controller($scope) {
            $scope.multipleChange = function(){
                status
                $scope.parent
            }
        }
        return {
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-status/multiple-status.html',
            restrict: 'E',
        };
    });


