'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function ($scope, users, task, tags, projects, $state, TasksService, context) {
    $scope.people = users;
    $scope.task = task;
    $scope.tags = tags;
    $scope.projects = projects;

    $scope.task.project = _.find(projects, function (proj) {
        return proj._id === task.project;
    });

    if (typeof $scope.task.assign === 'string') {
        $scope.task.assign = _.find(users, function (user) {
            return user._id === task.assign;
        });
    }

    $scope.tagInputVisible = false;

    $scope.statuses = ['Received', 'Completed'];

    $scope.getUnusedTags = function () {
        return _.chain($scope.tags).reject(function (t) {
            return $scope.task.tags.indexOf(t.term) >= 0;
        }).sortBy(function (a, b) {
            return b.count - a.count;
        }).pluck('term').value();
    };

    $scope.$watch('task.description', function (nVal, oVal) {
        if (nVal !== oVal && oVal) {
            $scope.delayedUpdate($scope.task);
        }
    });

    $scope.addTag = function (tag) {
        $scope.task.tags.push(tag);
        $scope.update(task);
        $scope.tagInputVisible = false;
    };

    $scope.removeTag = function (tag) {
        $scope.task.tags = _($scope.task.tags).without(tag);
        $scope.update($scope.task);
    };

    $scope.options = {
        theme: 'bootstrap',
        buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
    };

    $scope.dueOptions = {
        onSelect: function () {
            $scope.update($scope.task);
        },
        dateFormat: 'd.m.yy'
    };

    $scope.star = function (task) {
        TasksService.star(task).then(function () {
            $state.reload('main.tasks.byentity.details');
        });
    };

    $scope.deleteProject = function (event, task) {
        event.stopPropagation();
        delete task.project;
        $scope.update(task);
    };

    $scope.update = function (task) {
        if (context.entityName === 'discussion') {
            task.discussion = context.entityId;
        }

        TasksService.update(task).then(function () {
            $state.reload('main.tasks.byentity');
        });
    };

    $scope.delayedUpdate = _.debounce($scope.update, 500);

    if ($scope.task &&
        ($state.current.name === 'main.tasks.byentity.details' ||
        $state.current.name === 'main.search.task')) {
        $state.go('.activities');
    }
});
