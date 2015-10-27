'use strict';
angular.module('mean.icu.ui.modaldeletetasksbyentity', [])
    .directive('icuOpenModal', function ($modal, $state) {

        function link(scope, elem, attrs) {
            elem.bind('click', function() {

                if($state.current.name.indexOf('main.tasks.byentity') != -1)
                    scope.isTasks --;

                if(scope.isTasks) {
                    buildModal();
                } else
                    scope.deleteFn();

            });

            function buildModal() {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-directive/modal.html',
                    controller: controller,
                    resolve: {
                        entity: function () {
                            return scope.entityName;
                        }
                    }

                });

                modalInstance.result.then(function () {
                    scope.deleteFn();
                }, function () {
                    console.log('Modal dismissed');
                });
            }
        }


        ;

        return {
            restrict: 'A',
            scope: {
                isTasks: '=',
                deleteFn: '&',
                entityName: '@'
            },
            link: link
        };
    });

function controller($scope, $modalInstance, entity) {
    $scope.entity = {type: entity};

    $scope.ok = function () {
        if($scope.entity.textDelete && $scope.entity.textDelete == 'DELETE')
            $modalInstance.close();
        else
            $scope.cancel();

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
