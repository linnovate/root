'use strict';
angular.module('mean.icu.ui.modalcompartmentalization', [])
    .directive('icuCompModal', function($state, $uibModal, circlesService) {

        function link(scope, elem, attrs) {
            circlesService.getmine().then(function(data) {
                scope.mine = data;
                c19n();
            });

            function c19n() {
                if (scope.entity && scope.entity.circles && scope.entity.circles.c19n && scope.entity.circles.c19n.length) {
                    elem[0].classList.add('c19n');
                    scope.c19n = [];

                    var source = scope.mine.sources.find(function(s) {
                        return s._id === scope.entity.sources[0];
                    });

                    var c19n = scope.mine.allowed.c19n.find(function(c) {
                        return c._id === scope.entity.circles.c19n[0];
                    });

                    scope.c19n.push(source.name + '(' + c19n.circleId + ')');

                    if (scope.entity.circles.c19nGroups1 && scope.entity.circles.c19nGroups1.length)
                        scope.c19n.push(scope.mine.allowed.c19nGroups1.find(function(c) {
                            return c._id === scope.entity.circles.c19nGroups1[0];
                        }).name);

                    if (scope.entity.circles.c19nGroups2 && scope.entity.circles.c19nGroups2.length)
                        scope.c19n.push(scope.mine.allowed.c19nGroups2.find(function(c) {
                            return c._id === scope.entity.circles.c19nGroups2[0];
                        }).name);

                    scope.c19n = scope.c19n.join(', ');
                } else {
                    elem[0].classList.remove('c19n');

                }
            }
	            elem.bind('click', function() {
            		if(scope.mine && scope.mine !== ""){
	                	buildModal();
	                }
	            });

            function buildModal() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-compartmentalization/modal.html',
                    controller: CompModalCtrl,
                    resolve: {
                        entity: function() {
                            return scope.entity;
                        },
                        entityName: function() {
                            return scope.entityName;
                        },
                        data: function() {
                            return scope.mine
                        }
                    }

                });

                modalInstance.result.then(function() {

                }, function() {
                    c19n();
                    console.log('Modal dismissed');
                });
            }
        };

        return {
            restrict: 'A',
            scope: {
                entityName: '@',
                entity: '='
            },
            // template: '<div ng-if="entity && entity.circles && entity.circles.c19n && entity.circles.c19n.length" tooltips tooltip-template-url="/icu/components/modal-compartmentalization/tooltip.html" tooltip-side="left"></div>',
            template: '<div tooltips tooltip-template-url="/icu/components/modal-compartmentalization/tooltip.html" tooltip-side="left"></div>',
            link: link
        };
    });

function CompModalCtrl($scope, $uibModalInstance, entity, entityName, $injector, data) {
    var serviceMap = {
        project: 'ProjectsService',
        discussion: 'DiscussionsService',
        task: 'TasksService',
        office: 'OfficesService',
        folder: 'FoldersService'
    };

    var serviceName = serviceMap[entityName];
    var service = $injector.get(serviceName);

    $scope.c19n = {
        lists: {},
        isShown: {},
        selected: {}
    };

    $scope.c19n.lists.sources = data.sources;
    $scope.c19n.lists.sourcesObj = {};
    for (var i = 0; i < data.sources.length; i++) {
        $scope.c19n.lists.sourcesObj[data.sources[i]._id] = data.sources[i];
    }
    $scope.c19n.lists.c19nGroups1 = data.allowed.c19nGroups1;
    $scope.c19n.lists.c19nGroups1Obj = {};
    for (var i = 0; i < data.allowed.c19nGroups1.length; i++) {
        $scope.c19n.lists.c19nGroups1Obj[data.allowed.c19nGroups1[i]._id] = data.allowed.c19nGroups1[i];
    }
    $scope.c19n.lists.c19nGroups2 = data.allowed.c19nGroups2;
    $scope.c19n.lists.c19nGroups2Obj = {};
    for (var i = 0; i < data.allowed.c19nGroups2.length; i++) {
        $scope.c19n.lists.c19nGroups2Obj[data.allowed.c19nGroups2[i]._id] = data.allowed.c19nGroups2[i];
    }

    $scope.entity = entity;
    $scope.entity.sources = $scope.entity.sources || [];
    $scope.entity.circles = $scope.entity.circles || {};

    $scope.c19n.isShown.sources = !$scope.entity.sources[0];

    var setDeepC19nValue = function(obj, path, item) {
        var path = path.split('.');
        var i = 0;
        for (var len = path.length; i < len - 1; i++) {
            obj = obj[path[i]];
        };
        obj[path[i]] = obj[path[i]] || [];
        if (item) {
            obj[path[i]][0] = item;
        } else {
            obj[path[i]].shift();
        }
    };

    $scope.addC19n = function(path, item, type) {
        $scope.errorMessage = ''
        setDeepC19nValue($scope.entity, path, item);

        service.update($scope.entity).then(function(data) {
            $scope.c19n.isShown.sources = false;
            $scope.c19n.isShown[type] = false;
        }, function(error) {
            setDeepC19nValue($scope.entity, path);

            $scope.errorMessage = error.data && error.data.message ? error.data.message : 'permissions denied';
            $scope.c19n.isShown[type] = true;
        })


    };

    $scope.removeC19n = function(type) {
        if (type === 'sources') {
            $scope.entity.sources = $scope.entity.circles.c19nGroups1 = $scope.entity.circles.c19nGroups2 = [];
            $scope.c19n.isShown = {
                sources: true,
                c19nGroups1: false,
                c19nGroups2: false,
            }
        } else {
            $scope.entity.circles[type] = [];
            $scope.c19n.isShown[type] = true;
        }

        service.update($scope.entity)
    };

    $scope.showSelect = function() {
        if (!$scope.entity.sources[0]) {
            $scope.c19n.isShown.sources = true;
        } else {
            if (!$scope.entity.circles.c19nGroups1 || !$scope.entity.circles.c19nGroups1[0]) {
                $scope.c19n.isShown.c19nGroups1 = true;
            }
            if (!$scope.entity.circles.c19nGroups2 || !$scope.entity.circles.c19nGroups2[0]) {
                $scope.c19n.isShown.c19nGroups2 = true;
            }
        }
    }

    $scope.close = function() {
        $uibModalInstance.close();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}