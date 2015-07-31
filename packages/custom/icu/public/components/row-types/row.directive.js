'use strict';

angular.module('mean.icu.ui.rows', [])
.directive('icuListRow', function($compile, $http, $templateRequest) {
    var templates = {
        people: '/icu/components/row-types/people-row.html',
        task: '/icu/components/row-types/task-row.html',
        project: '/icu/components/row-types/project-row.html',
        'search-task': '/icu/components/row-types/search-task-row.html',
        'search-project': '/icu/components/row-types/search-project-row.html',
        'search-discussion': '/icu/components/row-types/search-discussion-row.html'
    };

    function compileTemplate($scope, $element, template) {
        $element.html(template);

        var scope = $scope.$new(true);
        scope.data = $scope.data;
        $compile($element.contents())(scope);
    }

    function link($scope, $element) {
        var templateUrl = templates[$scope.type];
        $templateRequest(templateUrl).then(function(result) {
            compileTemplate($scope, $element, result);
        });
    }

    return {
        restrict: 'A',
        scope: {
            type: '@',
            data: '='
        },
        link: link,
        transclude: true,
        template: ''
    };
});
