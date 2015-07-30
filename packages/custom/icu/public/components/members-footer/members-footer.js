'use strict';

angular.module('mean.icu.ui.membersfooter', [])
    .directive('icuMembersFooter', function () {
        function controller($scope, $injector, context) {
            var serviceMap = {
                projects: 'ProjectsService',
                discussions: 'DiscussionsService',
                tasks: 'TasksService'
            };

            var update = function (entity) {
                $scope.notAssigned = _.difference($scope.users, $scope.entity.watchers);
                var serviceName = serviceMap[context.main];
                var service = $injector.get(serviceName);
                service.update(entity);
            };
            $scope.showSelect = false;
            $scope.entity.watchers = _.filter($scope.users, function (user) {
                return $scope.entity.watchers.indexOf(user._id);
            });
            $scope.notAssigned = _.difference($scope.users, $scope.entity.watchers);

            $scope.triggerSelect = function () {
                $scope.showSelect = !$scope.showSelect;
            };

            $scope.addMember = function (member) {
                $scope.showSelect = false;
                $scope.entity.watchers.push(member);
                update($scope.entity);
            };

            $scope.deleteMember = function (member) {
                $scope.entity.watchers = _.reject($scope.entity.watchers, function (mem) {
                    return _.isEqual(member, mem);
                });
                update($scope.entity);
            };
        }

        return {
            restrict: 'A',
            scope: {
                entity: '=',
                users: '='
            },
            controller: controller,
            templateUrl: '/icu/components/members-footer/members-footer.html'
        };
    });
