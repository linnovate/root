'use strict';

angular.module('mean.icu.ui.tasklist', [])
.directive('icuTaskList', function() {
    function controller($scope) {
        if ($scope.groupTasks) {
            $scope.groupedTasks = _.chain($scope.tasks).groupBy(function(task) {
                var week = moment(task.created).isoWeek();
                return week;
            }).mapObject(function(value, key) {
                return {
                    startDate: moment().isoWeek(key).startOf('week').toDate(),
                    endDate: moment().isoWeek(key).endOf('week').toDate(),
                    tasks: value,
                    hidden: false
                };
            }).values()
            .value().reverse();
        }

        console.log($scope.groupedTasks);
    }

    return {
        restrict: 'A',
        templateUrl: 'icu/components/task-list/task-list.directive.template.html',
        scope: {
            tasks: '=',
            drawArrow: '=',
            groupTasks: '='
        },
        controller: controller
    };
});
