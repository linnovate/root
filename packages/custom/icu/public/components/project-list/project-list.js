'use strict';

angular.module('mean.icu.ui.projectlist', [])
.controller('ProjectListController', function($scope, $state, projects, context) {
    $scope.projects = projects;

    if ($scope.projects.length && $state.current.name === 'main.projects.byentity') {
        $state.go('.details', {
            id: $scope.projects[0]._id,
            entity: context.entityName,
            entityId: context.entityId
        });
    }
});
