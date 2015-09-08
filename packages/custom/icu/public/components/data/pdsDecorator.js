'use strict';

//Pasive data structure decorator
//Strips unrelevant data from entity before sending it to server
angular.module('mean.icu').config(function($provide) {
    var passiveDataSrtuctureDecorator = function($delegate) {
        var normalize = function(data) {
            if (!data) {
                return;
            }

            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i+=1) {
                var property = data[keys[i]];

                if (property && property._id) {
                    data[keys[i]] = property._id;
                } else if (property instanceof Array) {
                    normalize(property);
                }
            }
        };

        function action(cb) {
            return function (entity,context) {
                //var entityData = _.clone(entity);
                var entityData = _(entity).omit(function(value, key) {
                    return key.indexOf('__') === 0;
                });

                console.log(context,'---------------')
                normalize(entityData);

                return cb(entityData,context).then(function(result) {
                    if (!entity._id && result._id) {
                        entity._id = result._id;
                    }

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

    $provide.decorator('ActivitiesService', passiveDataSrtuctureDecorator);
    $provide.decorator('TasksService', passiveDataSrtuctureDecorator);
    $provide.decorator('ProjectsService', passiveDataSrtuctureDecorator);
    $provide.decorator('DiscussionsService', passiveDataSrtuctureDecorator);
    $provide.decorator('UsersService', passiveDataSrtuctureDecorator);
});
