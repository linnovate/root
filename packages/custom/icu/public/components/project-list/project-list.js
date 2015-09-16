'use strict';

angular.module('mean.icu.ui.projectlist', [])
    .controller('ProjectListController', function ($scope, $state, projects, ProjectsService, context, $filter) {
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
            field: 'created',
            isReverse: false
        };

        $scope.projectOrder = function(project) {
            if (project._id && $scope.sorting) {
                var parts = $scope.sorting.field.split('.');
                var result = project;
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

        $scope.projects = $filter('orderBy')($scope.projects, $scope.projectOrder);
        $scope.$watch('sorting.field', function() {
            $scope.projects = $filter('orderBy')($scope.projects, $scope.projectOrder);
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
