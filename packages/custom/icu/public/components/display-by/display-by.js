'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.switchTo = function(entityName, id) {
            $scope.context.switchTo(entityName, id).then(function() {
                $state.go('main.tasks.byentity', {
                    entity: $scope.context.entityName,
                    entityId: $scope.context.entityId
                });
            });
        }
    }

    return {
        restrict: 'A',
        scope: {
            projects: '=',
            discussions: '=',
            people: '=',
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller
    };
});
