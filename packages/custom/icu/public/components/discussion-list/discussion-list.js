'use strict';

angular.module('mean.icu.ui.discussionlist', [])
    .controller('DiscussionListController', function ($scope, $state, discussions, DiscussionsService, context, $filter) {
        $scope.discussions = discussions;
        $scope.showStarred = false;

        $scope.isCurrentState = function() {
            return $state.current.name.indexOf('main.discussions.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        };

        $scope.sorting  = {
            field: 'created',
            isReverse: false
        };

        $scope.discussionOrder = function(task) {
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

                return result;
            }
        };

        $scope.discussions = $filter('orderBy')($scope.discussions, $scope.taskOrder);
        $scope.$watch('sorting.field', function() {
            $scope.discussions = $filter('orderBy')($scope.discussions, $scope.taskOrder);
        });

        $scope.sortingList = [
            {
                title: 'Due',
                value: 'due'
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

        function navigateToDetails(discussion) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.discussions.all.details' : 'main.discussions.byentity.details';

            $state.go($scope.detailsState, {
                id: discussion._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId
            });
        }

        $scope.starredOnly = function () {
            $scope.showStarred = !$scope.showStarred;
            if ($scope.showStarred) {
                DiscussionsService.getStarred().then(function(starred) {
                    $scope.discussions = _(discussions).reduce(function(list, item) {
                        var contains = _(starred).any(function(s) {
                            return s._id === item._id;
                        });

                        if (contains) {
                            list.push(item);
                        }

                        return list;
                    }, []);

                    navigateToDetails($scope.discussions[0]);
                });
            } else {
                $scope.discussions = discussions;
                navigateToDetails($scope.discussions[0]);
            }
        };

        if ($scope.discussions.length) {
            if ($state.current.name === 'main.discussions.all' ||
                $state.current.name === 'main.discussions.byentity') {
                navigateToDetails($scope.discussions[0]);
            }
        }
        else {
            if ($state.current.name !== 'main.discussions.byentity.activities' ||
                $state.current.name !== 'main.discussions.byentity.details.activities') {
                $state.go('.activities');
            }
        }
    });
