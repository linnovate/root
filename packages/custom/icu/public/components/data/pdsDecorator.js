'use strict';

//Pasive data structure decorator
//Strips unrelevant data from entity before sending it to server
var passiveDataSrtuctureDecorator = function($delegate) {
    var normalize = function(data) {
        if (!data) {
            return;
        }

        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i+=1) {
            var property = data[keys[i]];

            if (keys[i] === 'title') {
                data[keys[i]] = property.trim();
            }

            if (property === null) {
                delete data[keys[i]];
                continue;
            }

            if (property && property._id) {
                data[keys[i]] = property._id;
            } else if (property instanceof Array && keys[i] !== 'sources' && keys[i] !== 'subTasks') {
                normalize(property);
            }
        }
    };

    var denormalize = function(data, newData) {
        if (!data) {
            return;
        }

        var keys = Object.keys(newData);
        for (var i = 0; i < keys.length; i+=1) {
            var property = newData[keys[i]];

            if (typeof(property) === 'object' || !data[keys[i]]) {
                data[keys[i]] = newData[keys[i]];
            }
        }
    };

    function action(cb) {
        return function (entity, context) {
            var entityData = _(entity).omit(function(value, key) {
                return key.indexOf('__') === 0;
            });

            normalize(entityData);

            return cb(entityData, context).then(function(result) {
                denormalize(entity, result);

                return entity;
            });
        };
    }

    var originalCreate = $delegate.create;
    if (originalCreate) {
        $delegate.create = action(originalCreate);
    }

    var originalUpdate = $delegate.update;
    if (originalUpdate) {
        $delegate.update = action(originalUpdate);
    }

    return $delegate;
};

angular.module('mean.icu.decorators.pdsDecorator', []);
angular.module('mean.icu.decorators.pdsDecorator').decorator('ActivitiesService', passiveDataSrtuctureDecorator);
angular.module('mean.icu.decorators.pdsDecorator').decorator('TasksService', passiveDataSrtuctureDecorator);
angular.module('mean.icu.decorators.pdsDecorator').decorator('ProjectsService', passiveDataSrtuctureDecorator);
angular.module('mean.icu.decorators.pdsDecorator').decorator('DiscussionsService', passiveDataSrtuctureDecorator);
angular.module('mean.icu.decorators.pdsDecorator').decorator('UsersService', passiveDataSrtuctureDecorator);
angular.module('mean.icu.decorators.pdsDecorator').decorator('OfficesService', passiveDataSrtuctureDecorator);
