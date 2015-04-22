'use strict';

angular.module('mean.icu.ui.userdetails', [])
.controller('UserDetailsController', function($scope) {
    var date = moment.duration(-5, 'minutes');

    $scope.notifications = [{
        entity: 'Task',
        entityName: 'Design homepage',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }, {
        entity: 'Task',
        entityName: 'Design homepage',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }, {
        entity: 'Task',
        entityName: 'Design homepage',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }];

    $scope.lastNotification = _($scope.notifications).last();
});
