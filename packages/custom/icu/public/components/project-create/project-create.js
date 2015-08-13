'use strict';

angular.module('mean.icu.ui.projectcreate', [])
.controller('ProjectCreateController', function ($scope, $state, ProjectsService, context) {
    $scope.project = {
        title: 'New title',
        color: '00acee'
    };

    $scope.options = {
        format: 'hex',
        alpha: false,
        swatch: true,
        swatchOnly: true,
        pickerPosition: 'top left',
        'case': 'lower'
    };

    $scope.create = function () {
        ProjectsService.create($scope.project).then(function (result) {
            $state.go('main.tasks.byentity', {
                id: result._id,
                entity: 'project',
                entityId: result._id
            }, { reload: true });
        });
    };
});
