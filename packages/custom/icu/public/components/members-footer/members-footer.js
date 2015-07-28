'use strict';

angular.module('mean.icu.ui.membersfooter', [])
    .directive('icuMembersFooter', function () {
        function controller($scope) {
            $scope.deleteMember = function (member) {

            };
        }

        return {
            restrict: 'A',
            scope: {
                members: '='
            },
            controller: controller,
            templateUrl: '/icu/components/members-footer/members-footer.html'
        };
    });
