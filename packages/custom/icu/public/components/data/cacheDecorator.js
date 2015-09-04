'use strict';

angular.module('mean.icu').config(function($provide) {
    var capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    var cacheDecorator = function($delegate) {
        var cachedEntities = {};

        var generateGetter = function (type, originalFn) {
            return function(id) {
                return originalFn(id).then(function(result) {
                    var entities = result;

                    _.each(cachedEntities, function(cachedEntity) {
                        var shouldPush = (
                            (cachedEntity[type] && cachedEntity[type] === id) //simple id
                            ||
                            (cachedEntity[type] && cachedEntity[type]._id === id) //object with id
                            ||
                            (cachedEntity.issue === type && cachedEntity.issueId === id) //update with "issue" and "issueId"
                        ) && (
                            !_.any(entities, function (entity) {
                                return cachedEntity._id === entity._id;
                            })
                        );

                        if (shouldPush) {
                            entities.push(cachedEntity);
                        }
                    });

                    return entities;
                });
            };
        };

        var originalCreate = $delegate.create;
        var create = function(entity) {
            return originalCreate(entity).then(function(result) {
                cachedEntities[result._id] = result;
                cachedEntities[result._id].discussion = entity.discussion;

                return result;
            });
        };
        $delegate.create = create;

        var getters = ['task', 'project', 'discussion'];

        _.each(getters, function(getter) {
            var entityName = capitalize(getter);
            var functionName = 'getBy' + entityName + 'Id';

            var originalFn = $delegate[functionName];
            var fun = generateGetter(getter, originalFn);
            $delegate[functionName] = fun;
        });

        var originalGetAll = $delegate.getAll;
        var getAll = function() {
            return originalGetAll().then(function(result) {
                var entities = result;

                _.each(cachedEntities, function (cachedEntity) {
                    var isFound = _.any(entities, function (e) {
                        return cachedEntity._id === e._id;
                    });

                    if (!isFound) {
                        entities.push(cachedEntity);
                    }
                });

                return entities;
            });
        };
        $delegate.getAll = getAll;

        return $delegate;
    };

    $provide.decorator('ActivitiesService', cacheDecorator);
    $provide.decorator('TasksService', cacheDecorator);
    $provide.decorator('ProjectsService', cacheDecorator);
    $provide.decorator('DiscussionsService', cacheDecorator);
});
