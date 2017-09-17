'use strict';

angular.module('mean.icu.ui.folderdetails')
    .controller('FolderTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
