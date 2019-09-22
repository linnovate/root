'use strict';

function ProjectListController($scope, projects, BoldedService, ProjectsService, UsersService, context, DiscussionsService) {

    let me;
    UsersService.getMe().then(function(result) {
      me = result;
    });

    $scope.items = projects.data || projects;

    var subProjects = [];
    $scope.items.forEach(function (item) {
        if (item.subProjects && item.subProjects.length > 0) {
            return subProjects = subProjects.concat(item.subProjects.filter(function (subProject) {
                return subProject !== 'undefined';
            }));
        }
    });

    $scope.loadNext = projects.next;
    $scope.loadPrev = projects.prev;

    $scope.entityName = 'projects';
    $scope.entityRowTpl = '/icu/components/project-list/project-row.html';

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    }

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'projects');
    };

    $scope.update = function(item) {
        return ProjectsService.update(item);
    }

    $scope.create = function(parent) {

        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        if(parent){
            newItem[parent.type] = parent.id;
        }
        return ProjectsService.create(newItem).then(function(result) {
            $scope.items.push(result);
            ProjectsService.data.push(result);
            return result;
        }).then(item => {
            if(parent && parent.type === 'discussion') {
                return DiscussionsService.getById(context.entityId)
                    .then(parentEntity => {
                        let parentParams = _.pick(parentEntity, ['watchers', 'permissions']);
                        Object.assign(item, parentParams);
                        return ProjectsService.update(item);
                    });
            } else {
                return item;
            }
        });
    };
}

angular.module('mean.icu.ui.projectlist', []).controller('ProjectListController', ProjectListController);
