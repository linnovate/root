'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context) {
        $scope.projectsList = [];
        $scope.projects.forEach(function(project) {
                   if(project.title)
                     $scope.projectsList.push(project);
                });

        $scope.officesList = [];
        $scope.offices.forEach(function(office) {
                    if(office.title)
                        $scope.officesList.push(office);
                });

        $scope.singularItemName = {
            discussions: "discussion",
            projects: "project",
            tasks: "task",
            offices: "office"
        };

        $scope.allItems = {
            projects: $scope.projects,
            discussions: $scope.discussions,
            tasks: $scope.tasks,
            offices: $scope.offices
        };

        // Reverse list in sideline
        $scope.projectsList = $scope.projectsList.slice();
        $scope.projectsList.reverse();
        $scope.allItems.projects = $scope.allItems.projects.slice();
        $scope.allItems.projects.reverse();
        $scope.allItems.discussions = $scope.allItems.discussions.slice();
        $scope.allItems.discussions.reverse();
        $scope.discussions = $scope.discussions.slice();
        $scope.discussions.reverse();

        $scope.context = context;

        $scope.displayLimit = {
            projects : 3,
            discussions : 3,
            offices: 3,
            reset : function() {
                this.projects = 3;
                this.discussions = 3;
                this.offices = 3;
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
        $scope.switchToAll = function (entityName, id) {
            $state.go('main.' + context.main + '.all.details.activities', {
                id: id,
                entity: entityName
            });
        }

        $scope.visible = {
            project: false,
            discussion: false,
            user: false,
            office: false
        };

        $scope.visible[$scope.context.entityName] = true;

    }

        function link($scope, $element, context) {
            $scope.showMore = function(limit, entityName) {
                if (($scope.displayLimit[entityName] + 3) >= limit) {
                    $scope.displayLimit[entityName] = limit;
                } else {
                    $scope.displayLimit[entityName]  += 3;

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
            icuDisplayBy: '=',
            offices: '='
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller,
        link: link
    };
});
