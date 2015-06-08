'use strict';

angular.module('mean.icu.ui.changecontent', [])
.directive('icuChangeContent', function($compile, $http, $templateCache) {
    var currentTemplateIndex = 0;

    function compileTemplate($scope, $element, template) {
        $element.html(template);

        var scope = $scope.$new(true);
        scope.data = $scope.data;
        scope.changeContent = $scope.changeContent;
        $compile($element.contents())(scope);
        $element.find('input').focus();
    }

    function loadTemplate($scope, $element) {
        var templateUrl = $scope.templates[currentTemplateIndex];

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

    function controller($scope, $element) {
        $scope.changeContent = function() {
            currentTemplateIndex = (currentTemplateIndex + 1) % $scope.templates.length;
            loadTemplate($scope, $element);
        }
    }

    function link($scope, $element) {
        console.log($scope.templates);
        loadTemplate($scope, $element);
    }

    return {
        restrict: 'A',
        scope: {
            data: '=',
            templates: '='
        },
        link: link,
        controller: controller,
        transclude: true,
        template: ''
    };
});
