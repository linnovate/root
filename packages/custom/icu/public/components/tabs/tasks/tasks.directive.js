'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsTasks', function ($state, $filter, TasksService, PermissionsService) {
        function controller($scope) {
            $scope.sorting = {
                field: 'created',
                isReverse: false
            };

            $scope.loadNext = $scope.tasks.next;
            $scope.loadPrev = $scope.tasks.prev;
            $scope.tasks = $scope.tasks.data || $scope.tasks;
            TasksService.tabData = $scope.tasks;
            $scope.taskOrder = function(task) {
                if (task._id && $scope.sorting) {
                    var parts = $scope.sorting.field.split('.');
                    var result = task;
                    for (var i = 0; i < parts.length; i+=1) {
                        if (result) {
                            result = result[parts[i]];
                        } else {
                            result = undefined;
                        }
                    }

                    //HACK: instead of using array of 2 values, this code concatenates
                    //2 values
                    //Reason: inconsistency in sorting results between sorting by one param
                    //and array of params
                    return result + task.title;
                }
            };

            $scope.havePermissions = function(type){
                //TODO: Fix after release: remove this if check and disable directive usage in tasks.my.activities without entity
                if($scope.entity)return (PermissionsService.havePermissions($scope.entity, type) && !$scope.isRecycled);
            };

            function sort() {
                var result = $filter('orderBy')($scope.tasks, $scope.taskOrder);
                Array.prototype.splice.apply($scope.tasks, [0, $scope.tasks.length].concat(result));
            }

            sort();

            $scope.manageTasks = function () {
                $state.go('main.tasks.byentity.tasks', {
                    entity: $scope.entityName,
                    id: $scope.entity._id,
                    entityId: $scope.entity._id
                },
                {
                    reload: true
                });
            };
        }

        return {
            restrict: 'A',
            scope: {
                tasks: '=',
                entityName: '@',
                entity: '='
            },
            controller: controller,
            replace: true,
            templateUrl: '/icu/components/tabs/tasks/tasks.html'
        };
    });

