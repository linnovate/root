'use strict';
angular.module('mean.icu.ui.modalcompartmentalization', [])
    .directive('icuCompModal', function ($state, $uibModal) {

        function link(scope, elem, attrs) {

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
            link: link
        };
    });

function CompModalCtrl($scope, $uibModalInstance, entity, entityName, $injector, circlesService) {
    var serviceMap = {
        projects: 'ProjectsService',
        discussions: 'DiscussionsService',
        tasks: 'TasksService',
        project: 'ProjectsService',
        discussion: 'DiscussionsService',
        task: 'TasksService'
    };

    $scope.sourceList = [];
    circlesService.getc19nList().then(function(data) {
		$scope.sourceList = data;
    });

    $scope.selectedSource = entity.circles.sources[0] ? entity.circles.sources[0] : null;
    $scope.isShowSourcesSelect = $scope.selectedSource ? false : true;
    $scope.errorMessage = ''
    var serviceName = serviceMap[entityName];
    var service = $injector.get(serviceName);
    $scope.addSource = function(item) {
    	$scope.errorMessage = ''
        entity.circles.sources[0] = item;
    	service.update(entity).then(function(data) {
    		$scope.selectedSource = item;
    	}, function(error){
    		if (error.data && error.data.message) {
    			$scope.errorMessage = error.data.message;
    		} else {
    			$scope.errorMessage = 'permissions denied'
    		}
    		// $scope.removeSource();
    		$scope.isShowSourcesSelect = true; 
    	})

    	$scope.isShowSourcesSelect = false;
    };

    $scope.removeSource = function() {
		entity.circles.sources = [];
		service.update(entity);
		$scope.selectedSource = null;

		$scope.isShowSourcesSelect = true; 
    };

    $scope.showSelect = function() {
		
    }

    $scope.close = function () {
		$uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
