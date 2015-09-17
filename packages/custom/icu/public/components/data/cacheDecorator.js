'use strict';

var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

var cacheDecorator = function($delegate) {
    var cachedEntities = {};
    var deletedEntities = [];

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
                            ||
                            (cachedEntity.issue === type && cachedEntity.issueId._id === id) //update with "issue" and "issueId"
                            ) && (
                                !_.any(entities, function (entity) {
                                    return cachedEntity._id === entity._id;
                                })
                                );

                    if (shouldPush) {
                        entities.push(cachedEntity);
                    }
                });

                entities = _(entities).reject(function(entity) {
                    return deletedEntities.indexOf(entity._id) !== -1;
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

            return entity;
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

            entities = _(entities).reject(function(entity) {
                return deletedEntities.indexOf(entity._id) !== -1;
            });

            return entities;
        });
    };
    $delegate.getAll = getAll;

    var originalRemove = $delegate.remove;
    var remove = function(id) {
        return originalRemove(id).then(function(result) {
            deletedEntities.push(id);

            return result;
        });
    };
    $delegate.remove = remove;

    return $delegate;
};

angular.module('mean.icu.decorators.cacheDecorator', []);
angular.module('mean.icu.decorators.cacheDecorator').decorator('ActivitiesService', cacheDecorator);
angular.module('mean.icu.decorators.cacheDecorator').decorator('TasksService', cacheDecorator);
angular.module('mean.icu.decorators.cacheDecorator').decorator('ProjectsService', cacheDecorator);
angular.module('mean.icu.decorators.cacheDecorator').decorator('DiscussionsService', cacheDecorator);
