'use strict';

angular.module('mean.icu.ui.projectdetails', [])
    .controller('ProjectDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      projects,
                                                      context,
                                                      $state,
                                                      ProjectsService,
                                                      $stateParams) {
        $scope.project = context.entity || entity;
        $scope.tasks = tasks.data || tasks;
        $scope.projects = projects.data || projects;
        $scope.shouldAutofocus = !$stateParams.nameFocused;

        ProjectsService.getStarred().then(function (starred) {
            $scope.project.star = _(starred).any(function (s) {
                return s._id === $scope.project._id;
            });
        });

        if (!$scope.project) {
            $state.go('main.projects.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watchGroup(['project.description', 'project.title'], function (nVal, oVal, scope) {
            if (nVal !== oVal && oVal) {
                var newContext;
                if (nVal[1] !== oVal[1]) {
                    newContext = {
                        name: 'title',
                        oldVal: oVal[1],
                        newVal: nVal[1],
                        action: 'renamed'
                    };
                } else {
                    newContext = {
                        name: 'description',
                        oldVal: oVal[0],
                        newVal: nVal[0]
                    };
                }
                $scope.delayedUpdate($scope.project, newContext);
            }
        });

        $scope.$watch('project.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.project, context);
            }
        });

        $scope.people = people.data || people;

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.project, 'due');
            },
            dateFormat: 'd.m.yy'
        };

        function navigateToDetails(project) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $state.go($scope.detailsState, {
                id: project._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (project) {
            ProjectsService.star(project).then(function () {
                navigateToDetails(project);
            });
        };

        $scope.deleteProject = function (project) {
            ProjectsService.remove(project._id).then(function () {

                $state.go('main.projects.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.update = function (project, context) {
            ProjectsService.update(project, context).then(function(res) {
                if (ProjectsService.selected && res._id === ProjectsService.selected._id) {
                    if (context.name === 'title') {
                        ProjectsService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        ProjectsService.selected.color = res.color;
                    }
                }
            });
        };

        $scope.updateCurrentProject = function(){
            ProjectsService.currentProjectName = $scope.project.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.project &&
            ($state.current.name === 'main.projects.all.details' ||
            $state.current.name === 'main.search.project' ||
            $state.current.name === 'main.projects.byentity.details')) {
            $state.go('.activities');
        }
    });
