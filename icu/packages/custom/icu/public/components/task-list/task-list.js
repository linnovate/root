'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function($scope, $state, tasks, projects) {
    $scope.tasks = _(tasks).map(function(t) {
        t.project = _(projects).find(function(p) { return p.id === t.project; });
        return t;
    });

    if ($scope.tasks.length) {
        $state.go('main.tasks.details', { id: $scope.tasks[0].id });
    }
});
