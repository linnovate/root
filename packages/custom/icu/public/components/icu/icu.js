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

var serviceMap = {
    project: 'ProjectsService',
    discussion: 'DiscussionsService'
};

angular.module('mean.icu').service('context', function($injector, $q) {
    return {
        entity: null,
        entityName: '',
        entityId: '',
        switchTo: function(entityName, id) {
            var defer = $q.defer();

            var serviceName = serviceMap[entityName];
            var service = $injector.get(serviceName);
            var self = this;
            service.getById(id).then(function(result) {
                self.entity = result;
                self.entityName = 'project';
                self.entityId = id;

                defer.resolve(self);
            });

            return defer.promise;
        }
    };
});
