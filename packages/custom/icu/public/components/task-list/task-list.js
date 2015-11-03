'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $state, tasks, TasksService, context, $filter, $stateParams) {
    $scope.tasks = tasks.data || tasks;
    $scope.loadNext = tasks.next;
    $scope.loadPrev = tasks.prev;

    $scope.autocomplete = context.entityName === 'discussion';

    $scope.showStarred = false;

    $scope.isCurrentState = function(id) {
        return $state.current.name.indexOf('main.tasks.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        $scope.sorting.isReverse = !$scope.sorting.isReverse;
    };

    $scope.sorting = {
        field: $stateParams.sort || 'created',
        isReverse: false
    };

    $scope.$watch('sorting.field', function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
            $state.go($state.current.name, { sort: $scope.sorting.field });
        }
    });

    $scope.sortingList = [
        {
            title: 'due',
            value: 'due'
        }, {
            title: 'project',
            value: 'project'
        }, {
            title: 'title',
            value: 'title'
        }, {
            title: 'status',
            value: 'status'
        }, {
            title: 'created',
            value: 'created'
        }
    ];

    function navigateToDetails(task, isStarred) {
        $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

        $state.go($scope.detailsState, {
            id: task._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId,
            starred: isStarred
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
                if ($scope.tasks[0]) {
                    navigateToDetails($scope.tasks[0], true);
                }
            });
        } else {
            $scope.tasks = tasks;
            if ($scope.tasks[0]) {
                navigateToDetails($scope.tasks[0], false);
            }
        }
    };

    if ($stateParams.starred) {
        $scope.starredOnly();
    }

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
