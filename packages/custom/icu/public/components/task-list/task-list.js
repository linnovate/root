'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $state, tasks, TasksService, context) {
    $scope.tasks = tasks;
    $scope.autocomplete = context.entityName === 'discussion';

    $scope.showStarred = false;

    $scope.isCurrentState = function(id) {
        return $state.current.name.indexOf('main.tasks.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        $scope.sorting.isReverse = !$scope.sorting.isReverse;
    };

    $scope.sorting  = {
        field: 'status',
        isReverse: false
    };

    $scope.sortingList = [
        {
            title: 'Due',
            value: 'due'
        }, {
            title: 'Project',
            value: 'project'
        }, {
            title: 'Title',
            value: 'title'
        }, {
            title: 'Status',
            value: 'status'
        }, {
            title: 'Created',
            value: 'created'
        }
    ];

    function navigateToDetails(task) {
        $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

        $state.go($scope.detailsState, {
            id: task._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId
        });
    }

    $scope.starredOnly = function () {
        $scope.showStarred = !$scope.showStarred;
        if ($scope.showStarred) {
            TasksService.getStarred().then(function(starred) {
                $scope.tasks = _(tasks).reduce(function(list, item) {
                    var contains = _(starred).any(function(s) {
                        return s._id === item._id;
                    });

                    if (contains) {
                        list.push(item);
                    }

                    return list;
                }, []);

                navigateToDetails($scope.tasks[0]);
            });
        } else {
            $scope.tasks = tasks;
            navigateToDetails($scope.tasks[0]);
        }
    };

    if ($scope.tasks.length) {
        if ($state.current.name === 'main.tasks.all' ||
            $state.current.name === 'main.tasks.byentity') {
                navigateToDetails($scope.tasks[0]);
        }
    } else if (
            $state.current.name !== 'main.tasks.byentity.activities' &&
            $state.current.name !== 'main.tasks.byentity.tasks') {
        $state.go('.activities');
    }
});
