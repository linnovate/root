'use strict';

angular.module('mean.icu.ui.discussionlist', [])
    .controller('DiscussionListController', function ($scope,
                                                      $state,
                                                      discussions,
                                                      DiscussionsService,
                                                      context,
                                                      $filter,
                                                      $stateParams) {
        $scope.discussions = discussions.data || discussions;
        $scope.loadNext = discussions.next;
        $scope.loadPrev = discussions.prev;

        $scope.showStarred = false;

        $scope.isCurrentState = function() {
            return $state.current.name.indexOf('main.discussions.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        };

        $scope.sorting  = {
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

        function navigateToDetails(discussion, isStarred) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.discussions.all.details' : 'main.discussions.byentity.details';

            $state.go($scope.detailsState, {
                id: discussion._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: isStarred
            });
        }

        $scope.starredOnly = function () {
            $scope.showStarred = !$scope.showStarred;
            if ($scope.showStarred) {
                DiscussionsService.getStarred().then(function (starred) {
                    $scope.discussions = _(discussions).reduce(function (list, item) {
                        var contains = _(starred).any(function (s) {
                            return s._id === item._id;
                        });

                        if (contains) {
                            list.push(item);
                        }

                        return list;
                    }, []);
                    if ($scope.discussions[0]) {
                        navigateToDetails($scope.discussions[0], true);
                    }
                });
            } else {
                $scope.discussions = discussions;
                if ($scope.discussions[0]) {
                    navigateToDetails($scope.discussions[0], false);
                }
            }
        };

        if ($stateParams.starred) {
            $scope.starredOnly();
        }

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
