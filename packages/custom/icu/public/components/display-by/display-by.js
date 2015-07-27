'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.switchTo = function(entityName, id) {
            $scope.context.switchTo(entityName, id).then(function(newContext) {

                $state.go('main.' + newContext.main  +  '.byentity', {
                    entity: newContext.entityName,
                    entityId: newContext.entityId
                });
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
            people: '='
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller
    };
});
