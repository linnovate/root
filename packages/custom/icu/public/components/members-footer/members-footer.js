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

            var getWatchersGroups = function() {
            	$scope.watchersGroups = [];
            	var obj;
            	for (var i = 0; i < $scope.entity.groups.length; i++) {
            		obj = circles.groups.filter(function ( obj ) {
					    if (obj.name === $scope.entity.groups[i]) {
					    	return obj;
					    }
					})[0];
					if (obj) {
						obj.type = 'group'
						$scope.watchersGroups.push(obj);
					}
            	};
            }

            var getNotAssigned = function() {
				var arr1 = _.pluck($scope.users, '_id');
				var arr2 = _.pluck($scope.entity.watchers, '_id');
				var diff = _.difference(arr1, arr2);
				var notAssigned = _.filter($scope.users, function(obj) { return diff.indexOf(obj._id) >= 0; });
				arr1 = _.pluck(circles.groups, 'name');
				diff = _.difference(arr1, $scope.entity.groups);
				var groupsNotAssigned = _.filter(circles.groups, function(obj) { return diff.indexOf(obj.name) >= 0; });
				return groupsNotAssigned.concat(notAssigned);
            }

            var update = function (entity,  member, action) {
                $scope.notAssigned = getNotAssigned();

                var serviceName = serviceMap[$stateParams.id ? context.main : context.entityName];
                var service = $injector.get(serviceName);
                var data = {
                    name:  member.name,
                    type: member.type === 'group' ? 'group' : 'user',
                    action: action
                }
                
            	service.update(entity, data);
            	getWatchersGroups();
                	
            };

            $scope.showSelect = false;
            var circles = {
            	"groups": [{
					"name": "group1",
					"numberOfPeople": 122,
				}, {
					"name": "group2",
					"numberOfPeople": 99,
 				}, {
					"name": "group3",
					"numberOfPeople": 2,
				}],
				"permissions": [],
				"compartmentalization": []
			}
			circles.groups.forEach(function(g) {
				g.type = 'group'
			})
			
            $scope.notAssigned = getNotAssigned();
			getWatchersGroups();

            $scope.triggerSelect = function () {
                $scope.showSelect = !$scope.showSelect;
                if ($scope.showSelect) {
                	$scope.animate = false;
                }
            };

            $scope.addMember = function (member) {
                $scope.showSelect = false;
                if (member.type === 'group') {
					$scope.entity.groups.push(member.name);
                } else {
                	$scope.entity.watchers.push(member);
                }
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
