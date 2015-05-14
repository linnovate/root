'use strict';

angular.module('mean.icu.ui.rows', [])
.directive('icuListRow', function($compile, $http, $templateCache) {
    var templates = {
        people: 'icu/components/row-types/people-row.html',
        task: 'icu/components/row-types/task-row.html'
    };

    function compileTemplate($scope, $element, template) {
        $element.html(template);

        var scope = $scope.$new(true);
        scope.data = $scope.data;
        $compile($element.contents())(scope);
    }

    function link($scope, $element) {
        var templateUrl = templates[$scope.type];

        var template = $templateCache.get(templateUrl);
        if (template) {
            compileTemplate($scope, $element, template);
        } else {
            $http.get(templateUrl).then(function(result) {
                compileTemplate($scope, $element, result.data);
                $templateCache.put(templateUrl, result.data);
            });
        }
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
