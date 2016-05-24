'use strict';

angular.module('mean.icu.ui.membersfooter', [])
    .directive('icuMembersFooter', function () {
        function controller($scope, $injector, context, $stateParams, $timeout) {
            var serviceMap = {
                projects: 'ProjectsService',
                discussions: 'DiscussionsService',
                tasks: 'TasksService',
                project: 'ProjectsService',
                discussion: 'DiscussionsService',
                task: 'TasksService'
            };

            var update = function (entity,  member, action) {
                $scope.notAssigned = _.difference(watchers, $scope.entity.watchers);

                var serviceName = serviceMap[$stateParams.id ? context.main : context.entityName];
                var service = $injector.get(serviceName);
                var data = {
                    name:  member.name,
                    type: member.type === 'group' ? 'group' : 'user',
                    action: action
                }
                // console.log('service', serviceName, entity, data)
                if (data.type !== 'group') {
                	service.update(entity, data);
                }
            };

            $scope.showSelect = false;
            $scope.groups = [{
				"name": "Chief of Staff",
				"numberOfPeople": 122,
			}, {
				"name": "GOC",
				"numberOfPeople": 99,
			}, {
				"name": "Navy",
				"numberOfPeople": 7,
			}, {
				"name": "IAF",
				"numberOfPeople": 3,
			}, {
				"name": "Land Force",
				"numberOfPeople": 2,
			}]

			for (var i = 0; i < $scope.groups.length; i++) {
				$scope.groups[i].type = 'group'
			}

            var watchers = $scope.groups.concat($scope.users);
            $scope.notAssigned = _.difference(watchers, $scope.entity.watchers);
            $scope.permissions = [];

            $scope.triggerSelect = function () {
                $scope.showSelect = !$scope.showSelect;
                if ($scope.showSelect) {
                	$scope.animate = false;
                }
            };

            // var groupsWatchers = [];
            $scope.addMember = function (member) {
                $scope.showSelect = false;
                $scope.entity.watchers.push(member);
                // if (member.type === 'group') {
                // 	groupsWatchers.push(member)
                // }
                update($scope.entity, member, 'added');
                $scope.animate = true;
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
                users: '=',
                groups: '='
            },
            controller: controller,
            templateUrl: '/icu/components/members-footer/members-footer.html'
        };
    })
