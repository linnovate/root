'use strict';

angular.module('mean.icu.ui.taskcreate', [])
.controller('TaskCreateController', function($scope, projects, TasksService, $state) {
    $scope.projects = projects;
    $scope.task = {};

    if ($scope.projects.length) {
        $scope.task.project = _($scope.projects).first()._id;
    }

    $scope.create = function() {
        var task = angular.copy($scope.task);
        task.tags = task.tags.split(' ');
        task.due = moment(task.due).toDate();

        TasksService.create(task).then(function(result) {
            $state.go('main.tasks.details', { id: result._id }, { reload: true });
        });
    };
});
