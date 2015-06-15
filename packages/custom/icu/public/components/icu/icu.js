'use strict';

angular.module('mean.icu').controller('IcuController', function($rootScope, $scope, me, $state, projects, context) {
    $scope.menu = {
        isHidden: false
    };

    $scope.currentContext = context;

    $scope.projects = projects;
    if ($scope.projects.length && $state.current.name === 'main.tasks.byentity') {

        $scope.currentContext.entity = $scope.projects[0];
        $scope.currentContext.entityName = 'project';
        $scope.currentContext.entityId = $scope.projects[0]._id;

        $state.go('main.tasks.byentity', { entity: $scope.currentContext.entityName, entityId: $scope.currentContext.entityId });
    }

    if (!me) {
        $state.go('login');
    }

    $rootScope.$on('$stateChangeError', function() {
        console.log(arguments);
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        console.log(arguments);
    });
});
