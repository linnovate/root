'use strict';

angular.module('mean.icu.data.usersservice', [])
.service('UsersService', function($http, $q, ApiUri) {
    var EnitityPrefix = '/users';
    var me = null;

    function getAll() {
        return $http.get(ApiUri + EnitityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getMe() {
        var deferred = $q.defer();

        if (me) {
            deferred.resolve(me);
        } else {
            $http.get('/api/users/me').then(function(result) {
                me = result.data;
                deferred.resolve(result.data);
            }, function() {
                deferred.resolve(null);
            });
        }

        return deferred.promise;
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + EnitityPrefix + '/project/' + id).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EnitityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function login(credentials) {
        return $http.post('/api/signin', credentials).then(function(result) {
            localStorage.setItem('JWT', result.data.token);
            return result.data;
        });
    }

    function logout(credentials) {
        return $http.get('/api/signout').then(function() {
            localStorage.removeItem('JWT');
        });
    }

    function register(credentials) {
        return $http.post('/api/signup', credentials).then(function(result) {
            localStorage.setItem('JWT', result.data.token);
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getMe: getMe,
        getById: getById,
        getByProjectId: getByProjectId,
        login: login,
        logout: logout,
        register: register
    };
});
