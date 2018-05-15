'use strict';

function ProjectListController($scope,
                               $window,
                               $state,
                               projects,
                               ProjectsService,
                               context,
                               $filter,
                               $stateParams,
                               EntityService) {

    $scope.projects = projects.data || projects;
    $scope.loadNext = projects.next;
    $scope.loadPrev = projects.prev;

    $scope.entityName = 'projects';
    $scope.entityRowTpl = '/icu/components/project-list/project-row.html';


    ProjectsService.getById($state.params.entityId).then(result=>{
        $scope.parentName = result.title;
    });

    $scope.print = function() {
        $window.print()
    };

    $scope.starred = $stateParams.starred;

    // activeToggle
    $scope.activeToggleList = EntityService.activeToggleList;
    $scope.activeToggle = {
            field: !EntityService.isActiveStatusAvailable() ? 'all' : $stateParams.activeToggle || 'active',
            disabled: !EntityService.isActiveStatusAvailable()
    };
    /*---*/

    if ($scope.projects.length > 0 && !$scope.projects[$scope.projects.length - 1].id) {
        $scope.projects = [$scope.projects[0]];
    }

    $scope.goToParent = function() {
        $state.go('main.projects.'+$scope.parentState+'.details',{entity:$scope.parentEntity,entityId:$scope.parentEntityId,id:$scope.parentId})
    };

    $scope.isCurrentState = function (id) {
        return $state.current.name.indexOf('main.projects.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        if($scope.sorting.field != "custom"){
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        }

        /*Made By OHAD - Needed for reversing sort*/
        $state.go($state.current.name, { sort: $scope.sorting.field });
    };

    $scope.update = function(item) {
        return ProjectsService.update(item.title);
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

    $scope.sorting = {
        field: $stateParams.sort || 'created',
        isReverse: false
    };

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

     if(context.entityName != "all"){
        $scope.sortingList.push({
            title: 'custom',
            value: 'custom'
        });
    }

    function navigateToDetails(project) {
        if(!project) return ;

        $scope.detailsState = context.entityName === 'all' ?
            'main.projects.all.details' : 'main.projects.byentity.details';

        $state.go($scope.detailsState, {
            id: project._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId,
        });
    }

    $scope.toggleStarred = function () {
        $state.go($state.current.name, { starred: !$stateParams.starred });
    };

    $scope.filterActive = function () {
        EntityService.activeStatusFilterValue = $scope.activeToggle.field ;
        $state.go($state.current.name, { activeToggle: $scope.activeToggle.field });
    };

    let possibleNavigate = $scope.projects.filter(function(t) {
        return t.recycled == null ;
    })

    if (possibleNavigate.length) {
        if ($state.current.name === 'main.projects.all' ||
            $state.current.name === 'main.projects.byentity') {
            navigateToDetails(possibleNavigate[0]);
        }
    }
    else {
        if ($state.current.name === 'main.projects.all') {
            return;
        }
        if (
            $state.current.name !== 'main.projects.byentity.activities' &&
            $state.current.name !== 'main.projects.byentity.details.activities') {
            $state.go('.activities');
        }
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
