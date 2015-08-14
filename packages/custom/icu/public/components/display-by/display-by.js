'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.switchTo = function(entityName, id) {
            $state.go('main.' + context.main  +  '.byentity', {
                entity: entityName,
                entityId: id
            });
        };

        $scope.visible = {
            project: false,
            discussion: false,
            user: false
        };

        $scope.visible[$scope.context.entityName] = true;
    }

    return {
        restrict: 'A',
        scope: {
            projects: '=',
            discussions: '=',
            people: '=',
            icuDisplayBy: '='
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller
    };
});
