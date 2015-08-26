'use strict';

angular.module('mean.icu.ui.discussionlist', [])
    .controller('DiscussionListController', function ($scope, $state, discussions, DiscussionsService, context) {
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
