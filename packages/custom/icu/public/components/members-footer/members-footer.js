'use strict';

angular.module('mean.icu.ui.membersfooter', [])
    .directive('icuMembersFooter', function () {
        function controller($scope, $injector, context, $stateParams) {
            var serviceMap = {
                projects: 'ProjectsService',
                discussions: 'DiscussionsService',
                tasks: 'TasksService',
                project: 'ProjectsService',
                discussion: 'DiscussionsService',
                task: 'TasksService'
            };

            var update = function (entity,  member, action) {
                $scope.notAssigned = _.difference($scope.users, $scope.entity.watchers);

                var serviceName = serviceMap[$stateParams.id ? context.main : context.entityName];
                var service = $injector.get(serviceName);
                var data = {
                    name:  member.name,
                    type: 'user',
                    action: action
                }
                service.update(entity, data);
            };
            $scope.showSelect = false;

            $scope.notAssigned = _.difference($scope.users, $scope.entity.watchers);

            $scope.triggerSelect = function () {
                $scope.showSelect = !$scope.showSelect;
            };

            $scope.addMember = function (member) {
                $scope.showSelect = false;
                $scope.entity.watchers.push(member);
                update($scope.entity, member, 'added');
            };

            $scope.deleteMember = function (member) {
                $scope.entity.watchers = _.reject($scope.entity.watchers, function (mem) {
                    return _.isEqual(member, mem);
                });
                update($scope.entity, member, 'removed');
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
