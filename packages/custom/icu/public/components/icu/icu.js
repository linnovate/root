'use strict';

angular.module('mean.icu').controller('IcuController', function($rootScope, $scope, me, $state, projects, context) {
    $scope.menu = {
        isHidden: false
    };

    $scope.currentContext = context;

    context.setMain('task');

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

    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name.indexOf('main.tasks') === 0) {
            context.setMain('task');
        } else if (toState.name.indexOf('main.discussions') === 0) {
            context.setMain('discussion');
        } else if (toState.name.indexOf('main.people') === 0) {
            context.setMain('user');
        }

        console.log(arguments);
    });
});
