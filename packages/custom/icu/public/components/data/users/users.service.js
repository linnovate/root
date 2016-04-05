'use strict';

angular.module('mean.icu.data.usersservice', [])
.service('UsersService', function($http, $q, ApiUri, Upload) {
    var EntityPrefix = '/users';
    var me = null;

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getMe() {
        var deferred = $q.defer();

        if (me) {
            deferred.resolve(me);
        } else {
            $http.get('/api/users/me').then(function(result) {
                if (!result.data) {
                    deferred.reject(null);
                } else {
                    getById(result.data._id).then(function(user) {
                        me = user;
                        deferred.resolve(me);
                    });
                }

            }, function() {
                deferred.reject(null);
            });
        }

        return deferred.promise;
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + '/projects/' + id + '/users').then(function(usersResult) {
            return usersResult.data;
        });
    }

    function getByDiscussionId(id) {
        return $http.get(ApiUri + '/discussions/' + id + '/users').then(function(usersResult) {
            return usersResult.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function update(user) {
        return $http.put('/api/users/' + user._id, user).then(function(result) {
            me = result.data;
            return result.data;
        });
    }


    function login(credentials) {
        return $http.post('/api/login', credentials).then(function(result) {
            localStorage.setItem('JWT', result.data.token);
            return result;
        }, function(err) {
        	return err;
        });
    }

    function logout() {
        return $http.get('/api/logout').then(function() {
            localStorage.removeItem('JWT');
        });
    }

    function register(credentials) {
        return $http.post('/api/register', credentials).then(function(result) {
            localStorage.setItem('JWT', result.data.token);
            return result;
        }, function(err) {
        	return err;
        });
    }

    function updateAvatar(file) {
        return Upload.upload({
            url: '/api/avatar',
            file: file
        }).success(function(data) {
            me.profile.avatar = data.avatar;
        });
    }

    return {
        getAll: getAll,
        getMe: getMe,
        getById: getById,
        getByProjectId: getByProjectId,
        getByDiscussionId: getByDiscussionId,
        login: login,
        logout: logout,
        register: register,
        update: update,
        updateAvatar: updateAvatar
    };
});
