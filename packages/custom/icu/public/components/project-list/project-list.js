'use strict';

angular.module('mean.icu.ui.projectlist', [])
.controller('ProjectListController', function($scope, $state, projects, context, ProjectsService) {
    $scope.projects = projects;

    $scope.showStarred = false;

    $scope.isCurrentState = function(id) {
        return $state.current.name.indexOf('main.projects.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        $scope.sorting.isReverse = !$scope.sorting.isReverse;
    };

    $scope.sorting  = {
        field: 'status',
        isReverse: false
    };

    $scope.sortingList = [
    {
        title: 'Due',
        value: 'due'
    },{
        title: 'Project',
        value: 'project'
    },{
        title: 'Title',
        value: 'title'
    },{
        title: 'Status',
        value: 'status'
    }
    ];
});
