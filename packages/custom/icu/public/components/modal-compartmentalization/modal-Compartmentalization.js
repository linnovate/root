'use strict';
angular.module('mean.icu.ui.modalcompartmentalization', [])
    .directive('icuCompModal', function ($state, $uibModal) {

        function link(scope, elem, attrs) {
            if(scope.entity.circles && scope.entity.circles.c19n)
                elem[0].classList.add('c19n');

            
            elem.bind('click', function() {
                buildModal();
            });

            function buildModal() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-compartmentalization/modal.html',
                    controller: CompModalCtrl,
                    resolve: {
                        entity: function () {
                            return scope.entity;
                        },
                        entityName: function () {
                            return scope.entityName;
                        },
                    }

                });

                modalInstance.result.then(function () {

                }, function () {
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
            template : '<div ng-if="entity.circles && entity.circles.c19n" tooltips tooltip-template-url="/icu/components/modal-compartmentalization/tooltip.html" tooltip-side="left"></div>',
            link: link
        };
    });





function CompModalCtrl($scope, $uibModalInstance, entity, entityName, $injector, circlesService) {
    var serviceMap = {
        project: 'ProjectsService',
        discussion: 'DiscussionsService',
        task: 'TasksService'
    };

    var serviceName = serviceMap[entityName];
    var service = $injector.get(serviceName);

    $scope.c19n = {
    	lists: {},
    	isShown: {},
    	selected: {}
    };

    circlesService.getc19nSources().then(function(data) {  
		$scope.c19n.lists.sources = data;
    });
    circlesService.getc19n().then(function(data) {
		$scope.c19n.lists.c19nGroups1 = Object.keys(data.circles.c19nGroups1);
		$scope.c19n.lists.c19nGroups2 = Object.keys(data.circles.c19nGroups2);
    });

    $scope.entity = entity;
    $scope.entity.sources = $scope.entity.sources || [];
    $scope.entity.circles = $scope.entity.circles || {};

    $scope.c19n.isShown.sources = !$scope.entity.sources[0];

    var setDeepC19nValue = function(obj, path, item){
	    var path = path.split('.');
	    var i = 0;
	    for (var len = path.length; i < len-1; i++){
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
    	}, function(error){
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

    $scope.close = function () {
		$uibModalInstance.close();
    };

    $scope.cancel = function () {
    	$uibModalInstance.dismiss('cancel');
	};
}
