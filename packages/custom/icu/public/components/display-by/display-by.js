'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.displayLimit = {
            projects : 3,
            discussions : 3,
            reset : function() {
                this.projects = 3;
                this.discussions = 3;
            }
        };

        $scope.switchTo = function(entityName, id) {

            // If we are switching between entities, then shrink the display limit again
            if (!$scope.visible[entityName]) {
                displayLimit.reset();
            }
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

        function link($scope, $element, context) {
            $scope.showMore = function(limit, entityName) {
                if (($scope.displayLimit[entityName] + 10) >= limit) {
                    $scope.displayLimit[entityName] = limit;
                } else {
                    $scope.displayLimit[entityName]  += 10;

                }
            };

            $scope.collapse = function(entityName) {
                $scope.displayLimit[entityName] = 3;
            };
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
        controller: controller,
        link: link
    };
});
