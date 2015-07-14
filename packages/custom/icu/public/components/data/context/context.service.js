'use strict';

angular.module('mean.icu').service('context', function($injector, $q) {
    var serviceMap = {
        project: 'ProjectsService',
        discussion: 'DiscussionsService'
    };

    var mainMap = {
        task: 'tasks',
        user: 'people'
    };

    return {
        entity: null,
        entityName: '',
        entityId: '',
        main: '',
        switchTo: function(entityName, id) {
            var defer = $q.defer();

            var serviceName = serviceMap[entityName];
            var service = $injector.get(serviceName);
            var self = this;
            service.getById(id).then(function(result) {
                self.entity = result;
                self.entityName = 'project';
                self.entityId = id;

                console.log(self);
                defer.resolve(self);
            });

            return defer.promise;
        },
        setMain: function(main) {
            this.main = mainMap[main];
        }
    };
});

