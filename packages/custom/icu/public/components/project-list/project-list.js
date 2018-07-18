'use strict';

function ProjectListController($scope, $state, $timeout, projects, ProjectsService, MultipleSelectService, context, $stateParams, EntityService) {

    $scope.items = projects.data || projects;

    var subProjects = [];
    $scope.items.forEach(function (item) {
        if (item.subProjects && item.subProjects.length > 0) {
            return subProjects = subProjects.concat(item.subProjects.filter(function (subProject) {
                return subProject !== 'undefined';
            }));
        }
    });

    subProjects && subProjects.forEach(function (item) {
        $scope.items.push(item);
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

    $scope.update = function(item) {
        return ProjectsService.update(item);
    }

    $scope.create = function(item) {

        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };

        return ProjectsService.create(newItem).then(function(result) {
            $scope.items.push(result);
            ProjectsService.data.push(result);
            return result;
        });
    };

    $scope.refreshSelected = function (entity) {
        MultipleSelectService.refreshSelectedList(entity);
        $scope.$broadcast('refreshList', {})
    };

    $scope.$on('changeCornerState', function(event, cornerState){
        setAllSelected(cornerState === 'all');
    });

    function setAllSelected(status){
        for(let i = 0; i < $scope.items.length; i++){
            $scope.items[i].selected = status;
        }
        MultipleSelectService.changeAllSelectedLIst(MultipleSelectService.getNoneRecycledItems($scope.items));
    }

    $scope.loadMore = function(start, LIMIT, sort) {
        if (!$scope.isLoading && $scope.loadNext) {
            $scope.isLoading = true;
            $scope.loadNext().then(function(items) {

                _(items.data).each(function(p) {
                    p.__state = creatingStatuses.Created;
                });

                var offset = $scope.displayOnly ? 0 : 1;

                if (items.data.length) {
                    var index = $scope.items.length - offset;
                    var args = [index, 0].concat(items.data);

                    [].splice.apply($scope.items, args);
                }

                $scope.loadNext = items.next;
                $scope.loadPrev = items.prev;
                $scope.isLoading = false;
            });
        }
    }
}

angular.module('mean.icu.ui.projectlist', []).controller('ProjectListController', ProjectListController);
