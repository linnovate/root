'use strict';

angular.module('mean.icu.ui.projectlistdirective', [])
    .directive('icuProjectList', function () {
        function controller($scope, context, ProjectsService, $state) {
            $scope.context = context;

            $scope.isCurrentState = function (id) {
                return ($state.current.name.indexOf('main.projects.byentity.details') === 0 ||
                        $state.current.name.indexOf('main.projects.all.details') === 0
                    ) && $state.params.id === id;
            };

            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $scope.newProject = ProjectsService.getNew(context.entityId);

            $scope.update = _.debounce(function (project) {
                ProjectsService.update(project);
            }, 300);

            var creatingStatuses = {
                NotCreated: 0,
                Creating: 1,
                Created: 2
            };

            var created = creatingStatuses.NotCreated;

            $scope.createOrUpdate = function (project) {
                if (created === creatingStatuses.NotCreated) {
                    created = creatingStatuses.Creating;
                    ProjectsService.create(project).then(function (result) {
                        created = creatingStatuses.Created;
                        project._id = result._id;
                    });
                } else if (created === creatingStatuses.Created) {
                    ProjectsService.update(project);
                }
            };
        }

        return {
            restrict: 'A',
            templateUrl: '/icu/components/project-list-directive/project-list.directive.template.html',
            scope: {
                projects: '=',
                drawArrow: '=',
                order: '=',
                displayOnly: '='
            },
            controller: controller
        };
    });
