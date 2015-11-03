'use strict';

angular.module('mean.icu.ui.projectlist', [])
    .controller('ProjectListController', function ($scope,
                                                   $state,
                                                   projects,
                                                   ProjectsService,
                                                   context,
                                                   $filter,
                                                   $stateParams) {
        $scope.projects = projects.data || projects;
        $scope.loadNext = projects.next;
        $scope.loadPrev = projects.prev;

        $scope.showStarred = false;

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.projects.byentity') === 0 &&
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

        function navigateToDetails(project, isStarred) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $state.go($scope.detailsState, {
                id: project._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: isStarred
            });
        }

        $scope.starredOnly = function () {
            $scope.showStarred = !$scope.showStarred;
            if ($scope.showStarred) {
                ProjectsService.getStarred().then(function (starred) {
                    $scope.projects = _(projects).reduce(function (list, item) {
                        var contains = _(starred).any(function (s) {
                            return s._id === item._id;
                        });

                        if (contains) {
                            list.push(item);
                        }

                        return list;
                    }, []);

                    if ($scope.projects[0]) {
                        navigateToDetails($scope.projects[0], true);
                    }
                });
            } else {
                $scope.projects = projects;
                if ($scope.projects[0]) {
                    navigateToDetails($scope.projects[0], false);
                }
            }
        };

        if ($stateParams.starred) {
            $scope.starredOnly();
        }

        if ($scope.projects.length) {
            if ($state.current.name === 'main.projects.all' ||
                $state.current.name === 'main.projects.byentity') {
                navigateToDetails($scope.projects[0]);
            }
        }
        else {
            if (
                $state.current.name !== 'main.projects.byentity.activities' &&
                $state.current.name !== 'main.projects.byentity.details.activities') {
                $state.go('.activities');
            }
        }
    });
