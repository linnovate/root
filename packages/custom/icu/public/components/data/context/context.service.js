'use strict';

angular.module('mean.icu').service('context', function ($injector, $q) {
    var serviceMap = {
        project: 'ProjectsService',
        discussion: 'DiscussionsService',
        user: 'UsersService'
    };

    var mainMap = {
        task: 'tasks',
        user: 'people',
        project: 'projects',
        discussion: 'discussions'
    };

    return {
        entity: null,
        entityName: '',
        entityId: '',
        main: '',
        switchTo: function (entityName, id) {
            var defer = $q.defer();

            if (entityName !== 'all') {
                var serviceName = serviceMap[entityName];
                var service = $injector.get(serviceName);

                var self = this;

                service.getById(id).then(function (result) {
                    self.entity = result;
                    self.entityName = entityName;
                    self.entityId = id;

                    defer.resolve(self);
                });
            } else {
                this.entityName = entityName;
                defer.resolve(this);
            }

            return defer.promise;
        },
        setMain: function (main) {
            this.main = mainMap[main];
        },
        getContextFromState: function(state) {
            var parts = state.name.split('.');

            if (parts[0] === 'main') {
                var reverseMainMap = _(mainMap).invert();
                var main = 'task';

                if (parts[1] !== 'search') {
                    main = reverseMainMap[parts[1]];
                }

                var params = state.params;
                var entityName = params.entity;

                if (!entityName && parts[2] === 'all') {
                    entityName = 'all';
                }

                return {
                    main: main,
                    entityName: entityName,
                    entityId: params.entityId
                };
            }
        }
    };
});
