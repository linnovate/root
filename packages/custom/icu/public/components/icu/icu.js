'use strict';

angular.module('mean.icu').controller('IcuController',
    function ($rootScope,
        $scope,
        me,
        $state,
        projects,
        discussions,
        people,
        context) {
    $scope.menu = {
        isHidden: false
    };

    $scope.projects = projects;
    $scope.discussions = discussions;
    $scope.people = people;

    $scope.currentContext = context;

    context.setMain('task');

    var state = $state.current;
    state.params = $state.params;

    var restoredContext = context.getContextFromState(state);

    context.setMain(restoredContext.main);
    if (restoredContext.entityName) {
        context.switchTo(restoredContext.entityName, restoredContext.entityId);
    } else {
        context.switchTo('project', $scope.projects[0]._id);
    }

    if (!me) {
        $state.go('login');
    }

    $rootScope.$on('$stateChangeError', function () {
        console.log(arguments);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name.indexOf('main.tasks') === 0) {
            context.setMain('task');
        } else if (toState.name.indexOf('main.projects') === 0) {
            context.setMain('project');
        } else if (toState.name.indexOf('main.discussions') === 0) {
            context.setMain('discussion');
        } else if (toState.name.indexOf('main.people') === 0) {
            context.setMain('user');
        }

        console.log(arguments);
    });
});
