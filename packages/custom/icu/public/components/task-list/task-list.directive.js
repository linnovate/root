'use strict';

angular.module('mean.icu.ui.tasklist', [])
.directive('icuTaskList', function() {
    return {
        restrict: 'A',
        templateUrl: 'icu/components/task-list/task-list.directive.template.html',
        scope: {
            tasks: '=',
            drawArrow: '='
        }
    };
});
