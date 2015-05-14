'use strict';

angular.module('mean.icu.ui.userdetails')
.controller('UserTasksController', function($scope, tasks, projects) {
    $scope.tasks = _(tasks).map(function(t) {
        t.project = _(projects).find(function(p) { return p._id === t.project; });
        return t;
    });
});
