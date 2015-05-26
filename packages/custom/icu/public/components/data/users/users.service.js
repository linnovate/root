'use strict';

angular.module('mean.icu.data.usersservice', [])
.service('UsersService', function($http, $q) {
    var me = null;

    var people = [{
        name: 'John Doe',
        tasks: 11,
        projects: 2,
        id: 1,
        active: true
    }, {
        name: 'Idan Arbel',
        tasks: 21,
        projects: 4,
        id: 2
    }, {
        name: 'Lior Kessos',
        tasks: 12,
        projects: 3,
        id: 3
    }];

    function getAll() {
        return people;
    }

    function getMe() {
        var deferred = $q.defer();

        if (me) {
            deferred.resolve(me);
        } else {
            $http.get('/api/users/me').then(function(result) {
                me = result.data;
                deferred.resolve(result.data);
            });
        }

        return deferred.promise;
    }

    function getById(id) {
        return _(people).find(function(user) {
            return user.id === id;
        });
    }

    return {
        getAll: getAll,
        getMe: getMe,
        getById: getById
    };
});
