'use strict';

angular.module('mean.icu.ui.projectlist', [])
    .controller('ProjectListController', function ($scope, $state, projects, ProjectsService, context) {
        $scope.projects = projects;
        $scope.showStarred = false;

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.projects.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        };

        $scope.sorting = {
            field: 'status',
            isReverse: false
        };

        $scope.sortingList = [
            {
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

        function navigateToDetails(project) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $state.go($scope.detailsState, {
                id: project._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId
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

                    navigateToDetails($scope.projects[0]);
                });
            } else {
                $scope.projects = projects;
                navigateToDetails($scope.projects[0]);
            }
        };

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
