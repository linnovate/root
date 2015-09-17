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

        $scope.statuses = ['new', 'inProgress', 'canceled', 'completed', 'archived'];


        //var _title = 'aaaa';
        //Object.defineProperty($scope.project, 'title', {
        //    configurable: true,
        //    get: function() {
        //        return _title; },
        //    set: function(newValue) {
        //        _title = newValue;
        //    }
        //})

        $scope.$watchGroup(['project.description', 'project.title'], function (nVal, oVal, scope) {

            if (nVal !== oVal && oVal) {
                var context;
                if(nVal[1] != oVal[1])
                    context = {
                        name: 'title',
                        oldVal: oVal[1],
                        newVal: nVal[1],
                        action: 'renamed'
                    }
                else
                    context = {
                        name: 'description',
                        oldVal: oVal[0],
                        newVal: nVal[0]
                    }
                $scope.delayedUpdate($scope.project,context);
            }
        });

        $scope.$watch('project.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal
                }
                $scope.update($scope.project, context);
            }
        });

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };
        $scope.dueOptions = {

            onSelect: function () {
                //context
                $scope.update($scope.project, 'due');
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

        $scope.update = function (project, context) {
            console.log("from details")
            ProjectsService.update(project, context);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.project &&
            ($state.current.name === 'main.projects.byentity.details' ||
            $state.current.name === 'main.search.project' ||
            $state.current.name === 'main.projects.all.details')) {
            $state.go('.activities');
        }
    });
