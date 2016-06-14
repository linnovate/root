'use strict';
angular.module('mean.icu.ui.modalcompartmentalization', [])
    .directive('icuCompModal', function ($state, $uibModal) {

        function link(scope, elem, attrs) {

            elem.bind('click', function() {
                // if($state.current.name.indexOf('main.tasks.byentity') != -1)
                //     scope.isTasks --;

               
                buildModal();
            });
            console.log('sssssssssssssssssss', scope.entity,  scope.entityName)
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
                            console.log('scope.entityName',scope.entityName)
                            return scope.entityName;
                        },
                    }

                });

                modalInstance.result.then(function () {
                    // scope.deleteFn();
                }, function () {
                    console.log('Modal dismissed');
                });
            }
        };

        return {
            restrict: 'A',
            scope: {

                // isTasks: '=',
                // deleteFn: '&',
                entityName: '@',
                entity: '='
            },
            link: link
        };
    });

function CompModalCtrl($scope, $uibModalInstance, entity, entityName, $injector) {
    var serviceMap = {
        projects: 'ProjectsService',
        discussions: 'DiscussionsService',
        tasks: 'TasksService',
        project: 'ProjectsService',
        discussion: 'DiscussionsService',
        task: 'TasksService'
    };

    $scope.comp = ['comp1', 'comp2', 'comp3', 'comp4']
    $scope.compList = $scope.comp;

    $scope.selectedComp = entity.circles ? entity.circles.sources : [];

    $scope.addComp = function(item) {
    	$scope.selectedComp.push(item)
    	$scope.compList = _.difference($scope.comp, $scope.selectedComp);
    	
    	var serviceName = serviceMap[entityName];
        var service = $injector.get(serviceName);
        
        entity.circles.sources = $scope.selectedComp;
    	
    	// var data = {
     //        name:  item,
     //        type: 'comp'
     //    }
    	service.update(entity);

    	$scope.isShowSelect = false;
    };

    $scope.removeComp = function(item) {
    	console.log('item',item,$scope.selectedComp)
    	var index = $scope.selectedComp.indexOf(item);
		$scope.selectedComp.splice(index, 1);
		$scope.compList = _.difference($scope.comp, $scope.selectedComp);
    };

    $scope.isShowSelect = $scope.selectedComp.length ? false : true;
    $scope.showSelect = function() {
		$scope.isShowSelect = true;   
    }

    $scope.close = function () {
		$uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}



