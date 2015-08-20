'use strict';

angular.module('mean.icu.ui.projectdetails', [])
    .controller('ProjectDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      projects,
                                                      context,
                                                      $state,
                                                      ProjectsService) {
        $scope.project = entity || context.entity;
        $scope.tasks = tasks;
        $scope.projects = projects;

        //ProjectsService.getStarred().then(function (starred) {
        //    $scope.project.star = _(starred).any(function (s) {
        //        return s._id === $scope.project._id;
        //    });
        //});

        if (!$scope.project) {
            $state.go('main.projects.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['New', 'In progress', 'Canceled', 'Completed', 'Archived'];

        $scope.$watchGroup(['project.description', 'project.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.project);
            }
        });

        $scope.$watch('project.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                $scope.update($scope.project);
            }
        });

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.project);
            },
            dateFormat: 'd.m.yy'
        };

        $scope.star = function (project) {
            ProjectsService.star(project).then(function () {
                $state.reload('main.projects.byentity.details');
            });
        };

        $scope.deleteProject = function (project) {
            ProjectsService.remove(project._id).then(function () {
                $state.go('main.projects.byentity', {
                    entity: context.entityName,
                    entityId: context.entityId
                }, {reload: true});
            });
        };

        $scope.update = function (project) {
            ProjectsService.update(project);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.project &&
            ($state.current.name === 'main.projects.byentity.details' ||
            $state.current.name === 'main.search.project' ||
            $state.current.name === 'main.projects.all.details')) {
            $state.go('.activities');
        }
    });
