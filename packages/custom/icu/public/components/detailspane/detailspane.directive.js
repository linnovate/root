'use strict';

angular.module('mean.icu.ui.detailspane', [])
.directive('icuDetailspane', function () {
    function controller() {

    }

    function link($scope, $element) {
        var changeHeight = function(event) {
            var description = $element.find('.description');
            var tabContent = $element.find('.tab-content');

            var target = angular.element(event.target);

            var height = target.parents('.tab-content').length ? '30%' : '65%';

            description.height(height);
            tabContent.height('calc(100% - ' + height + ' - 135px)');
        };

        var debounced = _.debounce(changeHeight, 100);

        $element.on('mouseover', debounced);
    }

    return {
        restrict: 'A',
        controller: controller,
        link: link,
        templateUrl: '/icu/components/detailspane/detailspane.html'
    };
});
