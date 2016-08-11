'use strict';

angular.module('mean.icu.ui.membersfooter', [])
    .directive('icuMembersFooter', function() {
        function controller($scope, $injector, context, $stateParams, $timeout, circlesService, UsersService) {
            var serviceMap = {
                projects: 'ProjectsService',
                discussions: 'DiscussionsService',
                tasks: 'TasksService',
                project: 'ProjectsService',
                discussion: 'DiscussionsService',
                task: 'TasksService'
            };
            UsersService.getMe().then(function(me) {
                $scope.me = me;
            });

            var getWatchersGroups = function() {
                $scope.watchersGroups = [];
                var obj;
                var groupTypes = ['personal', 'corporate'];
                for (var i = 0; i < groupTypes.length; i++) {
                    if ($scope.entity.circles && $scope.entity.circles[groupTypes[i]])
                        for (var j = 0; j < $scope.entity.circles[groupTypes[i]].length; j++) {
                            obj = groups.filter(function(obj) {
                                if (obj._id === $scope.entity.circles[groupTypes[i]][j]) {
                                    return obj;
                                }
                            })[0];
                            if (obj) {
                                obj.type = groupTypes[i];
                                $scope.watchersGroups.push(obj);
                            }
                        };
                }
            }

            var getNotAssigned = function() {
                var arr1 = _.filter($scope.users, function(u) {
                    return u._id;
                });
                arr1 = _.pluck(arr1, '_id');
                var arr2 = _.pluck($scope.entity.watchers, '_id');
                var diff = _.difference(arr1, arr2);
                var notAssigned = _.filter($scope.users, function(obj) {
                    return diff.indexOf(obj._id) >= 0;
                });
                arr1 = _.pluck(groups, '_id');
                var ePersonal = $scope.entity.circles && $scope.entity.circles.personal ? $scope.entity.circles.personal : [];
                var eCorporate = $scope.entity.circles && $scope.entity.circles.corporate ? $scope.entity.circles.corporate : [];

                diff = _.difference(arr1, ePersonal);
                diff = _.difference(diff, eCorporate);
                var groupsNotAssigned = _.filter(groups, function(obj) {
                    return diff.indexOf(obj._id) >= 0;
                });
                return groupsNotAssigned.concat(notAssigned);
            }

            var update = function(entity, member, action) {
                $scope.notAssigned = getNotAssigned();

                var serviceName = serviceMap[$stateParams.id ? context.main : context.entityName];
                var service = $injector.get(serviceName);
                var data = {
                    name: member.name,
                    type: member.type ? member.type : 'user',
                    action: action
                }

                service.update(entity, data);
                getWatchersGroups();

            };

            $scope.showSelect = false;
            var groups, personal, corporate;

            circlesService.getmine().then(function(data) {
                personal = data.allowed.personal;

                personal.forEach(function(g) {
                    g.type = 'personal'
                });

                corporate = data.allowed.corporate;

                corporate.forEach(function(g) {
                    g.type = 'corporate'
                });

                groups = personal.concat(corporate);

                $scope.notAssigned = getNotAssigned();
                getWatchersGroups();
            });

            $scope.triggerSelect = function() {
                $scope.showSelect = !$scope.showSelect;
                if ($scope.showSelect) {
                    $scope.animate = false;
                }
            };

            $scope.addMember = function(member) {
                $scope.showSelect = false;
                if (member.type) {
                    if (!$scope.entity.circles) $scope.entity.circles = {};
                    if (!$scope.entity.circles[member.type]) $scope.entity.circles[member.type] = [];
                    $scope.entity.circles[member.type].push(member._id);
                } else {
                    $scope.entity.watchers.push(member);
                }
                update($scope.entity, member, 'added');
                $scope.animate = true;
            };

            $scope.deleteMember = function(member) {
                if (member.type) {
                    $scope.entity.circles[member.type] = _.reject($scope.entity.circles[member.type], function(mem) {
                        return _.isEqual(member._id, mem);
                    });
                } else {
                    $scope.entity.watchers = _.reject($scope.entity.watchers, function(mem) {
                        return _.isEqual(member, mem);
                    });
                }
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