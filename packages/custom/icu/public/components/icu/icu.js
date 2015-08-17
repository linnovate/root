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

    var entityMap = {
        'project': 'projects',
        'discussion': 'discussions',
        'user': 'people',
    };

    function initializeContext(state) {
        var restoredContext = context.getContextFromState(state);
        if (restoredContext.entityName !== 'all') {
            var currentEntity = _($scope[entityMap[restoredContext.entityName]]).find(function(e) {
                return e._id === restoredContext.entityId;
            });

            restoredContext.entity = currentEntity;

            context.setMain(restoredContext.main);
            context.entityName = restoredContext.entityName || 'project';
            context.entity = restoredContext.entity || $scope.projects[0];
            context.entityId = restoredContext.entityId || $scope.projects[0]._id;
        } else {
            context.setMain(restoredContext.main);
            context.entityName = restoredContext.entityName;
            context.entity = undefined;
            context.entityId = undefined;
        }
    }

    var state = $state.current;
    state.params = $state.params;

    initializeContext(state);
    $scope.currentContext = context;

    if (!me) {
        $state.go('login');
    }

    $rootScope.$on('$stateChangeError', function () {
        console.log(arguments);
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var state = toState;
        state.params = toParams;

        initializeContext(state);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        console.log(arguments);
    });
});
